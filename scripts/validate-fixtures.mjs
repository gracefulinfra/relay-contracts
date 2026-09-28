// Validates every fixture against its schema.
//
// Layout: schemas/<name>.schema.json, with fixtures in fixtures/<name>/valid/*.json (must pass)
// and fixtures/<name>/invalid/*.json (must fail). Every schema needs at least one fixture of each
// kind, so a schema cannot silently go untested.
//
// A schema can also have cross-field invariants that JSON Schema cannot express, in
// scripts/invariants/<name>.mjs (default export: (doc) => string[] of violations). A fixture is
// valid only if it passes both the schema and the invariants.
//
// fixtures/<name>/expected-failures.json maps every invalid fixture to a substring of the error it
// must produce, so an invalid fixture cannot pass by failing for an unrelated reason.
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { Ajv2020 } from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const root = new URL("..", import.meta.url).pathname;
const schemaDir = join(root, "schemas");
const fixtureDir = join(root, "fixtures");
const invariantDir = join(root, "scripts", "invariants");

// allowUnionTypes: `type: ["string", "null"]` is the OpenAPI 3.1 nullability idiom.
// strictRequired is off because conditional `then: { required: [...] }` naming a property defined by
// the parent schema is idiomatic 2020-12, and that rule rejects it. Every other strict rule stays on.
const ajv = new Ajv2020({
  strict: true,
  strictRequired: false,
  allErrors: true,
  allowUnionTypes: true,
});
addFormats.default(ajv);

const readJSON = (path) => JSON.parse(readFileSync(path, "utf8"));
const listJSON = (dir) =>
  existsSync(dir)
    ? readdirSync(dir)
        .filter((f) => f.endsWith(".json"))
        .sort()
    : [];

const schemaFiles = listJSON(schemaDir).filter((f) => f.endsWith(".schema.json"));
if (schemaFiles.length === 0) {
  console.error("FAIL: no schemas found in schemas/");
  process.exit(1);
}

let failures = 0;
let checked = 0;
const fail = (msg) => {
  failures++;
  console.error(`FAIL ${msg}`);
};

// Register every schema first, so one schema can $ref another by its relative $id
// (export-record.schema.json reuses the manifest and receipt schemas).
for (const file of schemaFiles) ajv.addSchema(readJSON(join(schemaDir, file)));

for (const file of schemaFiles) {
  const name = file.replace(/\.schema\.json$/, "");
  let validate;
  try {
    validate = ajv.getSchema(readJSON(join(schemaDir, file)).$id);
    if (!validate) throw new Error("no $id");
  } catch (err) {
    fail(`${file}: schema does not compile: ${err.message}`);
    continue;
  }

  const invariantFile = join(invariantDir, `${name}.mjs`);
  const invariants = existsSync(invariantFile)
    ? (await import(pathToFileURL(invariantFile).href)).default
    : () => [];

  const expectedFile = join(fixtureDir, name, "expected-failures.json");
  const expected = existsSync(expectedFile) ? readJSON(expectedFile) : {};

  // Returns every error for a document: schema errors first, then invariant violations.
  const errorsFor = (doc) => {
    if (!validate(doc)) return validate.errors.map((e) => `${e.instancePath || "/"} ${e.message}`);
    return invariants(doc);
  };

  for (const kind of ["valid", "invalid"]) {
    const dir = join(fixtureDir, name, kind);
    const fixtures = listJSON(dir);
    if (fixtures.length === 0) fail(`${name}: no ${kind} fixtures in fixtures/${name}/${kind}/`);
    for (const fixture of fixtures) {
      checked++;
      const errors = errorsFor(readJSON(join(dir, fixture)));
      const label = `${name}/${kind}/${fixture}`;
      if (kind === "valid") {
        if (errors.length > 0) fail(`${label}: ${errors.join("; ")}`);
        else console.log(`ok   ${label}`);
        continue;
      }
      const want = expected[fixture];
      if (want === undefined) fail(`${label}: missing from ${name}/expected-failures.json`);
      else if (errors.length === 0) fail(`${label}: expected validation to fail`);
      else if (!errors.some((e) => e.includes(want)))
        fail(`${label}: failed, but not with "${want}": ${errors.join("; ")}`);
      else console.log(`ok   ${label} (${want})`);
    }
  }

  for (const listed of Object.keys(expected)) {
    if (!existsSync(join(fixtureDir, name, "invalid", listed)))
      fail(`${name}/expected-failures.json lists ${listed}, which does not exist`);
  }
}

// Fixture directories without a schema are almost always a typo.
for (const dir of existsSync(fixtureDir) ? readdirSync(fixtureDir) : []) {
  if (!schemaFiles.includes(`${dir}.schema.json`)) fail(`fixtures/${dir}: no matching schema`);
}

console.log(
  `\n${checked} fixtures checked across ${schemaFiles.length} schemas, ${failures} failures`,
);
process.exit(failures === 0 ? 0 : 1);
