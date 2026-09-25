// Validates every fixture against its schema.
//
// Layout: schemas/<name>.schema.json, with fixtures in fixtures/<name>/valid/*.json (must pass)
// and fixtures/<name>/invalid/*.json (must fail). Every schema needs at least one fixture of each
// kind, so a schema cannot silently go untested.
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { Ajv2020 } from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const root = new URL("..", import.meta.url).pathname;
const schemaDir = join(root, "schemas");
const fixtureDir = join(root, "fixtures");

const ajv = new Ajv2020({ strict: true, allErrors: true });
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

for (const file of schemaFiles) {
  const name = file.replace(/\.schema\.json$/, "");
  let validate;
  try {
    validate = ajv.compile(readJSON(join(schemaDir, file)));
  } catch (err) {
    fail(`${file}: schema does not compile: ${err.message}`);
    continue;
  }

  for (const kind of ["valid", "invalid"]) {
    const dir = join(fixtureDir, name, kind);
    const fixtures = listJSON(dir);
    if (fixtures.length === 0) fail(`${name}: no ${kind} fixtures in fixtures/${name}/${kind}/`);
    for (const fixture of fixtures) {
      checked++;
      const ok = validate(readJSON(join(dir, fixture)));
      const label = `${name}/${kind}/${fixture}`;
      if (kind === "valid" && !ok) fail(`${label}: ${ajv.errorsText(validate.errors)}`);
      else if (kind === "invalid" && ok) fail(`${label}: expected validation to fail`);
      else console.log(`ok   ${label}`);
    }
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
