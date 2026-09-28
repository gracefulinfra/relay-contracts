// Proves each relay-* Spectral rule in .spectral.yaml can fail. Every case breaks one convention
// in a copy of openapi/relay.v0.yaml and expects exactly that rule to report it, so a rule that
// silently matches nothing (a wrong JSONPath) fails this test instead of passing lint forever.
import { execFileSync } from "node:child_process";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const spectral = join(root, "node_modules", ".bin", "spectral");
const spec = readFileSync(join(root, "openapi", "relay.v0.yaml"), "utf8");

// Each mutation replaces the first occurrence of `from` with `to`.
const cases = [
  {
    rule: "relay-authz-present",
    from: "      operationId: getMe\n      tags: [me]\n      summary: The signed-in staff user and their grants\n      x-relay-authz: staff\n",
    to: "      operationId: getMe\n      tags: [me]\n      summary: The signed-in staff user and their grants\n",
  },
  {
    rule: "relay-authz-declared",
    from: "      operationId: getNetwork\n      tags: [network]\n      summary: Get the network\n      x-relay-authz: staff\n",
    to: "      operationId: getNetwork\n      tags: [network]\n      summary: Get the network\n      x-relay-authz: everyone\n",
  },
  {
    rule: "relay-idempotency-key",
    from: '      operationId: createTopic\n      tags: [topics]\n      summary: Create a topic\n      x-relay-authz: admin\n      parameters:\n        - $ref: "#/components/parameters/IdempotencyKey"\n',
    to: '      operationId: createTopic\n      tags: [topics]\n      summary: Create a topic\n      x-relay-authz: admin\n      parameters:\n        - $ref: "#/components/parameters/Cursor"\n',
  },
  {
    rule: "relay-public-is-anonymous",
    from: "      summary: The network's public profile\n      security: []\n",
    to: "      summary: The network's public profile\n",
  },
  {
    rule: "relay-staff-not-public",
    from: "      operationId: getMe\n      tags: [me]\n      summary: The signed-in staff user and their grants\n      x-relay-authz: staff\n",
    to: "      operationId: getMe\n      tags: [me]\n      summary: The signed-in staff user and their grants\n      x-relay-authz: public\n",
  },
  {
    rule: "relay-list-pagination",
    from: '      operationId: listTopics\n      tags: [topics]\n      summary: List topics\n      x-relay-authz: staff\n      parameters:\n        - $ref: "#/components/parameters/Cursor"\n',
    to: '      operationId: listTopics\n      tags: [topics]\n      summary: List topics\n      x-relay-authz: staff\n      parameters:\n        - $ref: "#/components/parameters/Limit"\n',
  },
  {
    rule: "relay-problem-json",
    from: "    Gone:\n      description: The resource was published and has been withdrawn.\n      content:\n        application/problem+json:\n",
    to: "    Gone:\n      description: The resource was published and has been withdrawn.\n      content:\n        application/json:\n",
  },
  {
    rule: "relay-merge-patch",
    from: '          application/merge-patch+json:\n            schema: { $ref: "#/components/schemas/TopicUpdate" }\n',
    to: '          application/json:\n            schema: { $ref: "#/components/schemas/TopicUpdate" }\n',
  },
];

const lint = (dir) => {
  try {
    execFileSync(
      spectral,
      [
        "lint",
        "-f",
        "json",
        "-r",
        join(dir, ".spectral.yaml"),
        join(dir, "openapi", "relay.v0.yaml"),
      ],
      {
        stdio: ["ignore", "pipe", "ignore"],
      },
    );
    return [];
  } catch (err) {
    return JSON.parse(err.stdout.toString()).map((r) => r.code);
  }
};

let failures = 0;
for (const c of cases) {
  if (!spec.includes(c.from)) {
    console.error(`FAIL ${c.rule}: mutation no longer matches the spec; update this test`);
    failures++;
    continue;
  }
  const dir = mkdtempSync(join(tmpdir(), "relay-spectral-"));
  try {
    cpSync(join(root, "schemas"), join(dir, "schemas"), { recursive: true });
    cpSync(join(root, ".spectral.yaml"), join(dir, ".spectral.yaml"));
    cpSync(join(root, "openapi"), join(dir, "openapi"), { recursive: true });
    writeFileSync(join(dir, "openapi", "relay.v0.yaml"), spec.replace(c.from, c.to));
    const codes = lint(dir);
    if (codes.includes(c.rule)) console.log(`ok   ${c.rule} fires`);
    else {
      console.error(`FAIL ${c.rule} did not fire (got: ${codes.join(", ") || "nothing"})`);
      failures++;
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
console.log(`\n${cases.length} Spectral rules checked, ${failures} failures`);
process.exit(failures === 0 ? 0 : 1);
