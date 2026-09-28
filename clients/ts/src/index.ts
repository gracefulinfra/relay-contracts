// Typed client for the Relay API (relay-contracts openapi/relay.v0.yaml).
//
// The types in ./generated are produced by openapi-typescript from the bundled spec and are
// committed, so CI can fail on drift. Requests go through openapi-fetch, so every path,
// parameter, body, and response is checked against the spec at compile time.
import createClient, { type Client, type ClientOptions, type Middleware } from "openapi-fetch";

import type { components, operations, paths } from "./generated/relay.v0.js";

export type { components, operations, paths };

/** Every named schema in the spec, for example `Schemas["Episode"]`. */
export type Schemas = components["schemas"];

/** An RFC 9457 problem document, as every error response returns. */
export type Problem = Schemas["Problem"];

/** The spec version this client was generated from (`info.version`). */
export const API_VERSION = "0.1.0";

export interface RelayClientOptions extends ClientOptions {
  /**
   * Returns the staff access token (relay-staff realm). It is sent on staff operations only,
   * never on `/public/*`, so public responses stay cacheable and never vary by credentials.
   */
  getAccessToken?: () => string | undefined | Promise<string | undefined>;
}

export type RelayClient = Client<paths>;

const PUBLIC_PREFIX = "/public/";

/** Creates a client. `baseUrl` includes the version prefix, for example `https://api.relay.localtest.me/v0`. */
export function createRelayClient(options: RelayClientOptions): RelayClient {
  const { getAccessToken, ...clientOptions } = options;
  const client = createClient<paths>(clientOptions);
  if (getAccessToken) client.use(bearerAuth(getAccessToken));
  return client;
}

function bearerAuth(getAccessToken: NonNullable<RelayClientOptions["getAccessToken"]>): Middleware {
  return {
    async onRequest({ request, schemaPath }) {
      if (schemaPath.startsWith(PUBLIC_PREFIX)) return undefined;
      const token = await getAccessToken();
      if (token) request.headers.set("Authorization", `Bearer ${token}`);
      return request;
    },
  };
}

/**
 * A new `Idempotency-Key`. Create one per intended operation and reuse it when retrying that
 * operation, so the server applies it at most once.
 */
export function newIdempotencyKey(): string {
  return crypto.randomUUID();
}

/** Narrows an unknown error body to a problem document. */
export function isProblem(value: unknown): value is Problem {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return typeof v.type === "string" && typeof v.title === "string" && typeof v.status === "number";
}
