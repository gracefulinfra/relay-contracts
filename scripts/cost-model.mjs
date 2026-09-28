// Phase 0 cost model (P0-08). See reports/cost-model.md for the method.
//
// Reads reports/cost-model/inputs.csv (one column per scenario) and prices.csv (one column per
// price set), and writes outputs.csv and outputs.md with one column per scenario@price-set pair.
//
// A blank price is UNKNOWN, not zero. Any cost that depends on an unknown price is reported as
// "unknown", and totals list which components are unknown instead of treating them as $0.
//
// Usage: node scripts/cost-model.mjs          regenerate the outputs
//        node scripts/cost-model.mjs --check  fail if the outputs are stale or the pitch example
//                                             (100k × 60 min × 128 kbps = 5.76 TB) does not reproduce
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const dir = join(new URL("..", import.meta.url).pathname, "reports", "cost-model");

// The columns reported, as [scenario, price set].
const COLUMNS = [
  ["demo", "local"],
  ["pilot", "aws_do"],
  ["pilot", "r2_do"],
  ["scale", "aws_do"],
  ["scale", "r2_do"],
];

// Minimal RFC 4180 parser: quoted fields may contain commas; no embedded newlines are used.
function parseCSV(text) {
  const rows = [];
  for (const line of text.split("\n")) {
    if (line.trim() === "") continue;
    const fields = [];
    let field = "";
    let quoted = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (quoted) {
        if (c === '"' && line[i + 1] === '"') {
          field += '"';
          i++;
        } else if (c === '"') quoted = false;
        else field += c;
      } else if (c === '"') quoted = true;
      else if (c === ",") {
        fields.push(field);
        field = "";
      } else field += c;
    }
    fields.push(field);
    rows.push(fields);
  }
  const [header, ...body] = rows;
  return body.map((r) => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ""])));
}

// Returns {key: {column: number | null}}, where null means blank (unknown).
function table(file, columns) {
  const out = {};
  for (const row of parseCSV(readFileSync(join(dir, file), "utf8"))) {
    out[row.key] = {};
    for (const c of columns) {
      const v = row[c].trim();
      if (v !== "" && !Number.isFinite(Number(v)))
        throw new Error(`${file}: ${row.key}.${c} is not a number: ${v}`);
      out[row.key][c] = v === "" ? null : Number(v);
    }
  }
  return out;
}

// Decimal units throughout, as in the pitch: 1 GB = 1e9 bytes, 1 TB = 1e12 bytes.
const bytesPerHour = (kbps) => (kbps * 1000 * 3600) / 8;
const GB = 1e9;

// The pitch formula: delivery bytes ≈ audio downloads × avg delivered bytes + video seconds × bitrate ÷ 8.
export function deliveryBytes({
  downloads,
  episodeMinutes,
  audioKbps,
  fraction = 1,
  videoSeconds = 0,
  videoKbps = 0,
}) {
  const avgDeliveredBytes = bytesPerHour(audioKbps) * (episodeMinutes / 60) * fraction;
  return downloads * avgDeliveredBytes + (videoSeconds * videoKbps * 1000) / 8;
}

// Money helpers: a cost is a number or null (unknown).
const mul = (qty, price) => (price === null ? null : qty * price);

function compute(i, p) {
  const q = {};
  const newAudioH = (i.shows * i.episodes_per_show_month * i.episode_minutes) / 60;
  const newEpisodes = i.shows * i.episodes_per_show_month;
  const newVideoH = newAudioH * i.video_share_of_episodes;
  const newVideoEpisodes = newEpisodes * i.video_share_of_episodes;

  // Delivery (monthly).
  const audioFormula = deliveryBytes({
    downloads: i.audio_downloads_month,
    episodeMinutes: i.episode_minutes,
    audioKbps: i.audio_delivered_kbps,
    fraction: i.audio_delivered_fraction,
  });
  const videoFormula = (i.video_viewing_hours_month * 3600 * i.video_delivered_kbps * 1000) / 8;
  const feedBytes = i.feed_requests_month * i.feed_kb_transferred * 1000;
  q.audio_delivery_tb = audioFormula / 1e12;
  q.video_delivery_tb = videoFormula / 1e12;
  q.formula_delivery_tb = (audioFormula + videoFormula) / 1e12;
  q.billed_delivery_tb =
    ((audioFormula + videoFormula) * i.delivery_overhead_factor + feedBytes) / 1e12;

  // Storage at steady state after catalog_months.
  const n = i.catalog_months;
  const audioMasters =
    (newAudioH * n * bytesPerHour(i.audio_master_kbps) +
      i.imported_back_catalog_hours * bytesPerHour(i.audio_delivered_kbps)) /
    GB;
  const audioDelivery =
    (newAudioH * n * bytesPerHour(i.audio_delivered_kbps) * i.audio_editions) / GB;
  const videoMasters = (newVideoH * n * bytesPerHour(i.video_master_kbps)) / GB;
  const videoRenditions = (newVideoH * n * bytesPerHour(i.video_rendition_kbps_sum)) / GB;
  const monthlyDeliveryAdds =
    (newAudioH * bytesPerHour(i.audio_delivered_kbps) * i.audio_editions +
      newVideoH * bytesPerHour(i.video_rendition_kbps_sum)) /
    GB;
  const retired = monthlyDeliveryAdds * i.correction_rate * (i.retired_retention_days / 30);
  const derived = newEpisodes * n * i.derived_small_gb_per_episode;
  const primary =
    (audioMasters + audioDelivery + videoMasters + videoRenditions + retired + derived) *
    i.storage_replication_factor;
  const masterBackups = (audioMasters + videoMasters) * i.master_backup_copies;
  const db = i.db_size_gb * (1 + i.db_backup_multiplier);

  // Requests (monthly).
  const segmentGets = (i.video_viewing_hours_month * 3600) / i.video_segment_seconds;
  const gets =
    i.audio_downloads_month * i.get_requests_per_download + segmentGets + i.feed_requests_month;
  const videoSegmentPuts =
    newVideoEpisodes * ((i.episode_minutes * 60) / i.video_segment_seconds) * i.video_renditions;
  const puts =
    newEpisodes * i.put_requests_per_audio_episode * (1 + i.correction_rate) +
    videoSegmentPuts * (1 + i.correction_rate);
  const logs = (gets * i.log_bytes_per_request * i.log_retention_months) / GB;

  q.storage_audio_masters_gb = audioMasters;
  q.storage_audio_delivery_gb = audioDelivery;
  q.storage_video_masters_gb = videoMasters;
  q.storage_video_renditions_gb = videoRenditions;
  q.storage_retired_versions_gb = retired;
  q.storage_derived_gb = derived;
  q.storage_replication_extra_gb = primary - primary / i.storage_replication_factor;
  q.storage_master_backups_gb = masterBackups;
  q.storage_db_and_backups_gb = db;
  q.storage_logs_gb = logs;
  q.storage_observability_gb = i.observability_storage_gb;
  const storedGb = primary + masterBackups + db + logs + i.observability_storage_gb;
  q.storage_total_gb = storedGb;
  q.get_requests_month = gets;
  q.put_requests_month = puts;

  // Compute (monthly, steady state). Corrections re-run the pipeline.
  const redo = 1 + i.correction_rate;
  const audioCpu = newAudioH * redo * i.audio_encode_cpu_h_per_media_h * i.audio_editions;
  const transcribeCpu = newAudioH * redo * i.transcribe_cpu_h_per_media_h;
  const videoCpu =
    newVideoH * redo * i.video_encode_cpu_h_per_media_h_per_rendition * i.video_renditions;
  q.cpu_hours_audio = audioCpu;
  q.cpu_hours_transcription = transcribeCpu;
  q.cpu_hours_video = videoCpu;
  const cpu = audioCpu + transcribeCpu + videoCpu;
  q.instance_hours = cpu / i.instance_vcpus;
  q.laptop_worker_wall_hours = cpu / i.local_worker_vcpus;

  // People.
  q.people_hours_month =
    i.engineering_hours_month + i.operations_hours_month + i.moderation_support_hours_month;

  // Money (monthly). null = unknown.
  const cost = {
    cost_storage: mul(storedGb, p.storage_gb_month),
    cost_egress: mul(q.billed_delivery_tb * 1000, p.egress_gb),
    cost_edge: mul(q.billed_delivery_tb * 1000, p.edge_gb),
    cost_requests:
      p.get_per_1000 === null || p.put_per_1000 === null
        ? null
        : (gets / 1000) * p.get_per_1000 + (puts / 1000) * p.put_per_1000,
    cost_batch_compute: mul(q.instance_hours, p.instance_hour),
    cost_cluster_nodes: mul(i.cluster_nodes, p.node_month),
    cost_control_plane: i.cluster_nodes === 0 ? 0 : p.k8s_control_plane_month,
  };
  const infraKnown = Object.values(cost).reduce((s, v) => s + (v ?? 0), 0);
  cost.cost_contingency = infraKnown * i.contingency_fraction;
  cost.cost_people = mul(q.people_hours_month, p.labour_rate_hour);
  Object.assign(q, cost);
  q.cost_total_known = Object.values(cost).reduce((s, v) => s + (v ?? 0), 0);
  q.cost_unknown_components = Object.entries(cost)
    .filter(([, v]) => v === null)
    .map(([k]) => k.replace(/^cost_/, ""))
    .join(" ");

  // One-off: onboarding the back catalog, and moving everything stored to another provider.
  q.oneoff_import_cpu_hours =
    i.imported_back_catalog_hours *
    (i.transcribe_cpu_h_per_media_h + i.audio_encode_cpu_h_per_media_h);
  q.oneoff_migration_gb = storedGb;
  q.oneoff_migration_egress_cost = mul(storedGb, p.egress_gb);
  return q;
}

const UNITS = {
  audio_delivery_tb: ["TB/month", 3],
  video_delivery_tb: ["TB/month", 3],
  formula_delivery_tb: ["TB/month", 3],
  billed_delivery_tb: ["TB/month", 3],
  storage_total_gb: ["GB", 1],
  get_requests_month: ["requests/month", 0],
  put_requests_month: ["requests/month", 0],
  instance_hours: ["hours/month", 1],
  laptop_worker_wall_hours: ["hours/month", 1],
  people_hours_month: ["hours/month", 0],
  cost_unknown_components: ["components", null],
  oneoff_import_cpu_hours: ["CPU-hours", 1],
  oneoff_migration_gb: ["GB", 1],
  oneoff_migration_egress_cost: ["USD", 2],
};
const unitOf = (k) =>
  UNITS[k] ??
  (k.startsWith("storage_")
    ? ["GB", 1]
    : k.startsWith("cpu_")
      ? ["CPU-hours/month", 1]
      : k.startsWith("cost_")
        ? ["USD/month", 2]
        : ["", 2]);
const fmt = (k, v) => {
  if (v === null) return "unknown";
  if (typeof v === "string") return v === "" ? "none" : v;
  return v.toFixed(unitOf(k)[1]);
};

export function run() {
  const scenarios = [...new Set(COLUMNS.map(([s]) => s))];
  const priceSets = [...new Set(COLUMNS.map(([, p]) => p))];
  const inputs = table("inputs.csv", scenarios);
  const prices = table("prices.csv", priceSets);
  const results = COLUMNS.map(([s, ps]) => {
    const i = Object.fromEntries(Object.entries(inputs).map(([k, v]) => [k, v[s]]));
    for (const [k, v] of Object.entries(i))
      if (v === null)
        throw new Error(
          `inputs.csv: ${k}.${s} is blank; inputs must be set (only prices may be unknown)`,
        );
    const p = Object.fromEntries(Object.entries(prices).map(([k, v]) => [k, v[ps]]));
    return compute(i, p);
  });
  const heads = COLUMNS.map(([s, p]) => `${s}@${p}`);
  const keys = Object.keys(results[0]);
  const csv =
    [
      ["metric", "unit", ...heads].join(","),
      ...keys.map((k) => [k, unitOf(k)[0], ...results.map((r) => fmt(k, r[k]))].join(",")),
    ].join("\n") + "\n";
  const md =
    [
      "<!-- Generated by scripts/cost-model.mjs from inputs.csv and prices.csv. Do not edit. -->",
      "",
      `| Metric | Unit | ${heads.join(" | ")} |`,
      `| --- | --- | ${heads.map(() => "---:").join(" | ")} |`,
      ...keys.map(
        (k) => `| \`${k}\` | ${unitOf(k)[0]} | ${results.map((r) => fmt(k, r[k])).join(" | ")} |`,
      ),
    ].join("\n") + "\n";
  return { csv, md, results };
}

function check({ csv, md, results }) {
  const errors = [];
  // Acceptance: the pitch's example, 100k complete downloads × 60 min × 128 kbps ≈ 5.76 TB (decimal).
  const pitch = deliveryBytes({ downloads: 100_000, episodeMinutes: 60, audioKbps: 128 });
  if (pitch !== 5.76e12) errors.push(`pitch example: got ${pitch} bytes, want 5.76e12`);
  const scale = results[COLUMNS.findIndex(([s]) => s === "scale")];
  if (Math.abs(scale.audio_delivery_tb - 5.76) > 1e-9)
    errors.push(`scale scenario audio delivery: got ${scale.audio_delivery_tb} TB, want 5.76`);
  if (readFileSync(join(dir, "outputs.csv"), "utf8") !== csv)
    errors.push("reports/cost-model/outputs.csv is stale: run `node scripts/cost-model.mjs`");
  if (readFileSync(join(dir, "outputs.md"), "utf8") !== md)
    errors.push("reports/cost-model/outputs.md is stale: run `node scripts/cost-model.mjs`");
  for (const e of errors) console.error(`FAIL ${e}`);
  if (errors.length) process.exit(1);
  console.log(`ok   cost model: pitch example ${pitch / 1e12} TB reproduced; outputs up to date`);
}

const out = run();
if (process.argv.includes("--check")) check(out);
else {
  writeFileSync(join(dir, "outputs.csv"), out.csv);
  writeFileSync(join(dir, "outputs.md"), out.md);
  console.log("wrote reports/cost-model/outputs.csv and outputs.md");
}
