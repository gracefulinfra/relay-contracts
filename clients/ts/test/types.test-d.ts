// Compile-time checks of the generated types. Vitest runs these with `tsc` (typecheck mode).
import { describe, expectTypeOf, it } from "vitest";

import { createRelayClient, type Schemas } from "../src/index.js";

const client = createRelayClient({ baseUrl: "https://api.relay.localtest.me/v0" });

describe("generated types", () => {
  it("keeps 3.1 nullability", () => {
    expectTypeOf<Schemas["Episode"]["seasonId"]>().toEqualTypeOf<string | null>();
    expectTypeOf<Schemas["Episode"]["pendingSchedule"]>().toEqualTypeOf<
      Schemas["EpisodeSchedule"] | null
    >();
    expectTypeOf<Schemas["RevisionUpdate"]["subtitle"]>().toEqualTypeOf<
      string | null | undefined
    >();
  });

  it("keeps enums and the shared JSON Schemas", () => {
    expectTypeOf<Schemas["PublicationStatus"]>().toEqualTypeOf<
      "unreleased" | "scheduled" | "publishing" | "published" | "unpublished"
    >();
    expectTypeOf<Schemas["ReleaseManifest"]["kind"]>().toEqualTypeOf<"release" | "correction">();
    expectTypeOf<Schemas["DeliveryReceipt"]["output"]["kind"]>().toEqualTypeOf<
      "feed_snapshot" | "website" | "media_edge" | "destination"
    >();
  });

  it("requires Idempotency-Key on mutating calls", () => {
    void client.POST("/revisions/{revisionId}/submit", {
      // @ts-expect-error: the Idempotency-Key header is required
      params: { path: { revisionId: "8b0f4a52-6f7e-4b61-9d3a-1c1b3f2e4d5a" } },
    });
  });

  it("rejects unknown paths", () => {
    // @ts-expect-error: there is no such path in v0
    void client.GET("/comments");
  });
});
