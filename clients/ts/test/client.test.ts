import { describe, expect, it } from "vitest";

import { createRelayClient, isProblem, newIdempotencyKey } from "../src/index.js";

const BASE = "https://api.relay.localtest.me/v0";
const EPISODE = "8b0f4a52-6f7e-4b61-9d3a-1c1b3f2e4d5a";

// Records each request and answers with the given response.
function fakeFetch(respond: (req: Request) => Response) {
  const seen: Request[] = [];
  const fetch = (input: Request) => {
    seen.push(input.clone());
    return Promise.resolve(respond(input));
  };
  return { fetch, seen };
}

const json = (status: number, body: unknown, type = "application/json") =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": type } });

describe("createRelayClient", () => {
  it("sends the staff token on staff operations", async () => {
    const { fetch, seen } = fakeFetch(() => json(200, { items: [], nextCursor: null }));
    const client = createRelayClient({ baseUrl: BASE, fetch, getAccessToken: () => "t0ken" });

    const { data } = await client.GET("/shows", { params: { query: { limit: 10 } } });

    expect(data).toEqual({ items: [], nextCursor: null });
    expect(seen[0]?.url).toBe(`${BASE}/shows?limit=10`);
    expect(seen[0]?.headers.get("Authorization")).toBe("Bearer t0ken");
  });

  it("never sends credentials to the public API", async () => {
    const { fetch, seen } = fakeFetch(() => json(200, { guid: "x" }));
    const client = createRelayClient({ baseUrl: BASE, fetch, getAccessToken: () => "t0ken" });

    await client.GET("/public/episodes/{episodeId}", {
      params: { path: { episodeId: EPISODE } },
    });

    expect(seen[0]?.url).toBe(`${BASE}/public/episodes/${EPISODE}`);
    expect(seen[0]?.headers.has("Authorization")).toBe(false);
  });

  it("sends Idempotency-Key and the body on mutating calls", async () => {
    const { fetch, seen } = fakeFetch(() => json(201, { title: "Signal Garden" }));
    const client = createRelayClient({ baseUrl: BASE, fetch });
    const key = newIdempotencyKey();

    await client.POST("/shows", {
      params: { header: { "Idempotency-Key": key } },
      body: {
        slug: "signal-garden",
        title: "Signal Garden",
        author: "Relay Demo Network",
        language: "en",
        categories: [{ name: "Science", subcategory: "Nature" }],
      },
    });

    expect(seen[0]?.method).toBe("POST");
    expect(seen[0]?.headers.get("Idempotency-Key")).toBe(key);
    expect(await seen[0]?.json()).toMatchObject({ slug: "signal-garden" });
  });

  it("sends JSON Merge Patch with If-Match", async () => {
    const { fetch, seen } = fakeFetch(() => json(200, {}));
    const client = createRelayClient({ baseUrl: BASE, fetch });

    await client.PATCH("/revisions/{revisionId}", {
      params: {
        path: { revisionId: EPISODE },
        header: { "Idempotency-Key": newIdempotencyKey(), "If-Match": '"3"' },
      },
      body: { subtitle: null },
      headers: { "Content-Type": "application/merge-patch+json" },
    });

    expect(seen[0]?.headers.get("If-Match")).toBe('"3"');
    expect(seen[0]?.headers.get("Content-Type")).toBe("application/merge-patch+json");
    expect(await seen[0]?.text()).toBe('{"subtitle":null}');
  });

  it("returns problem+json errors as typed problems", async () => {
    const problem = {
      type: "https://relay.dev/problems/invalid-transition",
      title: "Invalid transition",
      status: 409,
      code: "invalid_transition",
      currentState: "released",
    };
    const { fetch } = fakeFetch(() => json(409, problem, "application/problem+json"));
    const client = createRelayClient({ baseUrl: BASE, fetch });

    const { data, error } = await client.POST("/revisions/{revisionId}/submit", {
      params: { path: { revisionId: EPISODE }, header: { "Idempotency-Key": newIdempotencyKey() } },
    });

    expect(data).toBeUndefined();
    expect(isProblem(error)).toBe(true);
    expect(error).toMatchObject({ status: 409, currentState: "released" });
  });
});

describe("helpers", () => {
  it("makes distinct UUID idempotency keys", () => {
    const a = newIdempotencyKey();
    expect(a).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(newIdempotencyKey()).not.toBe(a);
  });

  it("recognises problem documents", () => {
    expect(isProblem({ type: "about:blank", title: "x", status: 400 })).toBe(true);
    expect(isProblem({ title: "x" })).toBe(false);
    expect(isProblem(null)).toBe(false);
  });
});
