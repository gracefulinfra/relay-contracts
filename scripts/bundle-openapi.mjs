// Bundles openapi/relay.v0.yaml into one self-contained document for the code generators.
//
// The source spec reuses the JSON Schemas in schemas/ instead of copying them. Each one is
// referenced exactly once, as a whole component:
//
//   components:
//     schemas:
//       ReleaseManifest:
//         $ref: "../schemas/release-manifest.schema.json"
//
// The bundler inlines the file as that component, and moves its `$defs` to components prefixed
// with the component name (`$defs/asset` becomes `ReleaseManifestAsset`), so names never collide
// with the spec's own components or with another file's `$defs`. Any other external `$ref`
// fails the bundle.
//
// Usage: node scripts/bundle-openapi.mjs <source.yaml> <output.json>
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve, relative } from "node:path";
import { parse } from "yaml";

const [source, output] = process.argv.slice(2);
if (!source || !output) {
  console.error("usage: bundle-openapi.mjs <source.yaml> <output.json>");
  process.exit(2);
}

const root = resolve(new URL("..", import.meta.url).pathname);
const doc = parse(readFileSync(source, "utf8"));
const schemas = doc.components?.schemas ?? {};
const pascal = (s) => s.replace(/(^|[-_.])([a-z0-9])/g, (_, __, c) => c.toUpperCase());

// Walks every object and array, calling fn on each object.
const walk = (node, fn) => {
  if (Array.isArray(node)) node.forEach((n) => walk(n, fn));
  else if (node && typeof node === "object") {
    fn(node);
    Object.values(node).forEach((n) => walk(n, fn));
  }
};

// 1. Inline each whole-component external reference.
for (const [name, schema] of Object.entries(schemas)) {
  const ref = schema?.$ref;
  if (typeof ref !== "string" || ref.startsWith("#")) continue;
  if (Object.keys(schema).length !== 1) {
    throw new Error(`components.schemas.${name}: an external $ref must be the only key`);
  }
  const file = resolve(dirname(source), ref);
  const external = JSON.parse(readFileSync(file, "utf8"));
  const defs = external.$defs ?? {};
  delete external.$defs;
  delete external.$schema;
  delete external.$id;

  const target = (def) => `#/components/schemas/${name}${pascal(def)}`;
  const rewrite = (node) =>
    walk(node, (obj) => {
      if (typeof obj.$ref !== "string") return;
      if (obj.$ref === "#") obj.$ref = `#/components/schemas/${name}`;
      else if (obj.$ref.startsWith("#/$defs/"))
        obj.$ref = target(obj.$ref.slice("#/$defs/".length));
      else throw new Error(`${ref}: unsupported $ref ${obj.$ref}`);
    });

  rewrite(external);
  schemas[name] = { ...external, "x-relay-source": relative(root, file) };
  for (const [def, defSchema] of Object.entries(defs)) {
    const defName = `${name}${pascal(def)}`;
    if (schemas[defName]) throw new Error(`${ref}: $defs/${def} collides with ${defName}`);
    rewrite(defSchema);
    schemas[defName] = defSchema;
  }
}

// 2. Every remaining $ref must be internal and resolve.
walk(doc, (obj) => {
  if (typeof obj.$ref !== "string") return;
  if (!obj.$ref.startsWith("#/"))
    throw new Error(`external $ref outside a whole component: ${obj.$ref}`);
  const target = obj.$ref
    .slice(2)
    .split("/")
    .reduce((node, key) => node?.[key.replace(/~1/g, "/").replace(/~0/g, "~")], doc);
  if (target === undefined) throw new Error(`unresolved $ref ${obj.$ref}`);
});

mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, JSON.stringify(doc, null, 2) + "\n");
console.log(`bundled ${relative(root, resolve(source))} -> ${relative(root, resolve(output))}`);
