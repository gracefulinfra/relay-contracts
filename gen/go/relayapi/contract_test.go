package relayapi_test

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"reflect"
	"strings"
	"testing"

	"github.com/gracefulinfra/relay-contracts/gen/go/relayapi"
	"github.com/oapi-codegen/nullable"
)

// fixturesDir is the repo's fixtures directory. It is outside this module, so these tests skip
// when the module is used from the module cache.
func fixturesDir(t *testing.T) string {
	t.Helper()
	dir := filepath.Join("..", "..", "..", "fixtures")
	if _, err := os.Stat(dir); err != nil {
		t.Skipf("fixtures not available: %v", err)
	}
	return dir
}

// TestFixtureRoundTrip decodes every valid JSON Schema fixture into the generated type, encodes
// it again, and checks that nothing was lost or added. It covers nullable fields, oneOf-with-null,
// and the conditional (if/then) parts of the shared schemas.
func TestFixtureRoundTrip(t *testing.T) {
	dir := fixturesDir(t)
	tests := []struct {
		schema string
		newVal func() any
	}{
		{"release-manifest", func() any { return new(relayapi.ReleaseManifest) }},
		{"delivery-receipt", func() any { return new(relayapi.DeliveryReceipt) }},
	}
	for _, tt := range tests {
		files, err := filepath.Glob(filepath.Join(dir, tt.schema, "valid", "*.json"))
		if err != nil || len(files) == 0 {
			t.Fatalf("%s: no valid fixtures (%v)", tt.schema, err)
		}
		for _, file := range files {
			t.Run(tt.schema+"/"+filepath.Base(file), func(t *testing.T) {
				raw, err := os.ReadFile(file)
				if err != nil {
					t.Fatal(err)
				}
				val := tt.newVal()
				dec := json.NewDecoder(bytes.NewReader(raw))
				dec.DisallowUnknownFields()
				if err := dec.Decode(val); err != nil {
					t.Fatalf("decode: %v", err)
				}
				out, err := json.Marshal(val)
				if err != nil {
					t.Fatalf("encode: %v", err)
				}
				var want, got any
				_ = json.Unmarshal(raw, &want)
				_ = json.Unmarshal(out, &got)
				if !reflect.DeepEqual(want, got) {
					t.Errorf("round trip changed the document\nwant %s\n got %s", raw, out)
				}
			})
		}
	}
}

// TestNullability checks the two shapes that JSON Merge Patch and the 3.1 `type: [T, "null"]`
// idiom depend on: a required nullable field always serializes (as null when unset), and an
// optional nullable field keeps "absent" and "null" apart.
func TestNullability(t *testing.T) {
	var ep relayapi.Episode
	ep.SeasonId.SetNull()
	ep.PendingSchedule.SetNull()
	out, err := json.Marshal(ep)
	if err != nil {
		t.Fatal(err)
	}
	for _, want := range []string{`"seasonId":null`, `"pendingSchedule":null`} {
		if !strings.Contains(string(out), want) {
			t.Errorf("Episode JSON lacks %s: %s", want, out)
		}
	}

	tests := []struct {
		body              string
		specified, isNull bool
	}{
		{`{}`, false, false},
		{`{"subtitle":null}`, true, true},
		{`{"subtitle":"New subtitle"}`, true, false},
	}
	for _, tt := range tests {
		var patch relayapi.RevisionUpdate
		if err := json.Unmarshal([]byte(tt.body), &patch); err != nil {
			t.Fatalf("%s: %v", tt.body, err)
		}
		if patch.Subtitle.IsSpecified() != tt.specified || patch.Subtitle.IsNull() != tt.isNull {
			t.Errorf("%s: specified=%v null=%v, want %v %v", tt.body,
				patch.Subtitle.IsSpecified(), patch.Subtitle.IsNull(), tt.specified, tt.isNull)
		}
	}
}

// TestEmbeddedSpec checks that the spec embedded in the stub loads.
func TestEmbeddedSpec(t *testing.T) {
	spec, err := relayapi.GetSwagger()
	if err != nil {
		t.Fatalf("GetSwagger: %v", err)
	}
	if spec.OpenAPI != "3.1.1" {
		t.Errorf("openapi = %q, want 3.1.1", spec.OpenAPI)
	}
	if spec.Paths.Find("/public/episodes/{episodeId}") == nil {
		t.Error("embedded spec lacks /public/episodes/{episodeId}")
	}
}

// stub implements two operations. Calling any other operation panics, which fails the test.
type stub struct {
	relayapi.StrictServerInterface
	gotKey string
}

const knownEpisode = "8b0f4a52-6f7e-4b61-9d3a-1c1b3f2e4d5a"

func (s *stub) GetPublicEpisode(_ context.Context, req relayapi.GetPublicEpisodeRequestObject) (relayapi.GetPublicEpisodeResponseObject, error) {
	if req.EpisodeId.String() != knownEpisode {
		return relayapi.GetPublicEpisode404ApplicationProblemPlusJSONResponse{
			NotFoundApplicationProblemPlusJSONResponse: relayapi.NotFoundApplicationProblemPlusJSONResponse{
				Type: "https://relay.dev/problems/not-found", Title: "Not found", Status: 404,
			},
		}, nil
	}
	cache := "public, max-age=60"
	ep := relayapi.PublicEpisode{Guid: "urn:imported:legacy-42", Title: "Tide Pools at Dawn"}
	ep.SeasonNumber.SetNull()
	return relayapi.GetPublicEpisode200JSONResponse{
		Body:    ep,
		Headers: relayapi.GetPublicEpisode200ResponseHeaders{CacheControl: &cache},
	}, nil
}

func (s *stub) CreateShow(_ context.Context, req relayapi.CreateShowRequestObject) (relayapi.CreateShowResponseObject, error) {
	s.gotKey = req.Params.IdempotencyKey
	return relayapi.CreateShow201JSONResponse{Body: relayapi.Show{Title: req.Body.Title}}, nil
}

// TestStrictServer exercises the generated std-http strict server: routing under /v0, path
// parameter parsing, a problem+json error, response headers, and the required Idempotency-Key.
func TestStrictServer(t *testing.T) {
	s := &stub{}
	h := relayapi.HandlerWithOptions(
		relayapi.NewStrictHandler(s, nil),
		relayapi.StdHTTPServerOptions{BaseURL: "/v0"},
	)

	tests := []struct {
		name, method, path, body string
		headers                  map[string]string
		wantStatus               int
		wantType                 string
		wantBody                 string
	}{
		{"public episode", http.MethodGet, "/v0/public/episodes/" + knownEpisode, "", nil,
			200, "application/json", `"seasonNumber":null`},
		{"problem+json", http.MethodGet, "/v0/public/episodes/0e8a3d52-6f7e-4b61-9d3a-1c1b3f2e4d5a", "", nil,
			404, "application/problem+json", `"status":404`},
		{"bad uuid", http.MethodGet, "/v0/public/episodes/not-a-uuid", "", nil,
			400, "", ""},
		{"missing Idempotency-Key", http.MethodPost, "/v0/shows",
			`{"slug":"signal-garden","title":"Signal Garden","author":"Relay","language":"en","categories":[{"name":"Science"}]}`,
			nil, 400, "", ""},
		{"with Idempotency-Key", http.MethodPost, "/v0/shows",
			`{"slug":"signal-garden","title":"Signal Garden","author":"Relay","language":"en","categories":[{"name":"Science"}]}`,
			map[string]string{"Idempotency-Key": "b1c3e7d2-4f6a-4e2b-9c1d-7a8b9c0d1e2f"},
			201, "application/json", `"title":"Signal Garden"`},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest(tt.method, tt.path, strings.NewReader(tt.body))
			req.Header.Set("Content-Type", "application/json")
			for k, v := range tt.headers {
				req.Header.Set(k, v)
			}
			rec := httptest.NewRecorder()
			h.ServeHTTP(rec, req)
			if rec.Code != tt.wantStatus {
				t.Fatalf("status = %d, want %d: %s", rec.Code, tt.wantStatus, rec.Body)
			}
			if tt.wantType != "" && rec.Header().Get("Content-Type") != tt.wantType {
				t.Errorf("Content-Type = %q, want %q", rec.Header().Get("Content-Type"), tt.wantType)
			}
			if !strings.Contains(rec.Body.String(), tt.wantBody) {
				t.Errorf("body lacks %s: %s", tt.wantBody, rec.Body)
			}
		})
	}
	if s.gotKey != "b1c3e7d2-4f6a-4e2b-9c1d-7a8b9c0d1e2f" {
		t.Errorf("handler got Idempotency-Key %q", s.gotKey)
	}
}

// Keep the nullable import used even if the generator stops re-exporting it.
var _ = nullable.Nullable[string]{}
