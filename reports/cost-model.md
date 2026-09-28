# Cost model (P0-08)

This model estimates Relay's monthly cost from usage, using the pitch §9 formula. The inputs are
parameters, and provider prices are inputs too. It is an **effort and usage model, not a quote**. No
provider was chosen, and no money was spent.

| File                                                  | Purpose                                                                                   |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| [`cost-model/inputs.csv`](cost-model/inputs.csv)      | Usage and effort parameters, one column per scenario, with a note on each                 |
| [`cost-model/prices.csv`](cost-model/prices.csv)      | Price sets, one column each. A **blank cell is unknown**, never zero. Sources are cited   |
| [`scripts/cost-model.mjs`](../scripts/cost-model.mjs) | Computes the outputs. `pnpm test` checks the 5.76 TB example and that outputs are current |
| [`cost-model/outputs.csv`](cost-model/outputs.csv)    | Generated results                                                                         |
| [`cost-model/outputs.md`](cost-model/outputs.md)      | The same results as a table                                                               |

To change an assumption, edit a CSV and run `pnpm cost-model`, then commit the regenerated outputs.

## The formula, and the pitch example

```text
delivery bytes ≈ audio downloads × avg delivered bytes + video viewing seconds × delivered bitrate ÷ 8
```

`avg delivered bytes` = bitrate ÷ 8 × episode length × `audio_delivered_fraction`. Units are decimal
(1 TB = 10¹² bytes), as in the pitch.

The pitch example is 100,000 complete downloads of a 60-minute, 128 kbps file:
100,000 × (128,000 ÷ 8 × 3,600) = 100,000 × 57.6 MB = **5.76 TB**. `node scripts/cost-model.mjs --check`
asserts this exactly, and also asserts that the `scale` scenario's audio delivery is 5.76 TB. The
overhead factor for retries and overlapping ranges is applied **after** the formula, so it does not
change the reproduced figure.

## Scenarios

| Scenario | What it represents                                                                                                      | Price sets        |
| -------- | ----------------------------------------------------------------------------------------------------------------------- | ----------------- |
| `demo`   | The portfolio demo: two fictional shows plus CC imports, audio only, on the owner's laptop. Traffic is the owner and CI | `local`           |
| `pilot`  | The pitch's 2-show pilot: **10k downloads a month**, half the episodes with video, 500 viewing hours, 3 always-on nodes | `aws_do`, `r2_do` |
| `scale`  | **100k downloads a month** (the pitch example: 6 shows, 60 minutes, 128 kbps), an ad-free edition, 5,000 viewing hours  | `aws_do`, `r2_do` |

The price sets are **illustrative**, not recommendations. They bracket egress, which dominates at scale:

- `local`: the laptop. Every price is an explicit **0**, because the hardware is sunk and owner time is
  unpaid (owner decision, 2026-09-28). The zero is recorded, not assumed.
- `aws_do`: S3 Standard us-east-1 storage, requests, and **$0.09/GB** internet egress, plus DigitalOcean
  droplets for nodes and batch compute.
- `r2_do`: Cloudflare R2 storage and requests with **free egress**, plus the same DigitalOcean compute.

The prices were checked on 2026-09-28. The URLs are in `prices.csv`. Tiered and free allowances (the S3
100 GB/month egress allowance, the R2 free tier, the S3 $0.085/GB tier above 10 TB) are **not** applied,
so the figures lean conservative.

## Results

Monthly figures at steady state (12 months of releases, plus the imported back catalog). The full table
is [`cost-model/outputs.md`](cost-model/outputs.md).

| Metric                                    | demo@local |                    pilot@aws_do | pilot@r2_do |    scale@aws_do | scale@r2_do |
| ----------------------------------------- | ---------: | ------------------------------: | ----------: | --------------: | ----------: |
| Audio delivery (formula)                  |   0.009 TB |                        0.432 TB |    0.432 TB |     **5.76 TB** | **5.76 TB** |
| Video delivery (formula)                  |          0 |                        0.563 TB |    0.563 TB |        5.625 TB |    5.625 TB |
| Billed delivery (with overhead and feeds) |   0.009 TB |                        1.095 TB |    1.095 TB |       12.539 TB |   12.539 TB |
| Stored, all copies                        |    65.1 GB |                        920.5 GB |    920.5 GB |        3,709 GB |    3,709 GB |
| Storage                                   |         $0 |                          $21.17 |      $13.81 |          $85.31 |      $55.64 |
| Egress                                    |         $0 |                          $98.59 |          $0 |       $1,128.47 |          $0 |
| Requests                                  |         $0 |                           $0.18 |       $0.16 |           $1.61 |       $1.44 |
| Batch compute (encode, transcribe)        |         $0 |                           $0.84 |       $0.84 |           $3.38 |       $3.38 |
| Always-on nodes (3 × 4 vCPU / 8 GB)       |         $0 |                            $144 |        $144 |            $144 |        $144 |
| Contingency (20% of known infrastructure) |         $0 |                          $52.96 |      $31.76 |         $272.55 |      $40.89 |
| **Known cash total per month**            |     **$0** |                     **$317.73** | **$190.57** |   **$1,635.31** | **$245.36** |
| Unknown (not zero)                        |       none | edge/CDN, control plane, people |        same |            same |        same |
| People hours per month                    |         43 |                              63 |          63 |             140 |         140 |
| One-off: move everything stored elsewhere |      65 GB |           920 GB, $82.85 egress |  920 GB, $0 | 3.7 TB, $333.81 |  3.7 TB, $0 |

### What the numbers say

1. **The demo costs $0 in cash and 43 hours a month of owner time.** That meets the owner's budget
   (about 10 h/week, $0). Twelve months of demo content is about 65 GB, mostly WAV masters. Its
   transcription and encoding need about 1.7 wall-clock hours a month on a 4-vCPU laptop worker, if
   the faster-whisper assumption holds. The binding constraints are **time and laptop RAM**, not money
   (see [phase-0.md](phase-0.md#local-resource-budget)).
2. **At pilot scale, infrastructure alone costs more than buying.** The known infrastructure is
   $191–$318 a month, **before** edge, control plane, and people costs. The comparable vendor stack
   (Captivate or Transistor plus Ghost) lists at **$72–$128 a month**, including operations
   ([ADR 0005](../adr/0005-build-vs-buy.md#published-cost-for-the-same-pilot),
   [vendors.md §C](../evaluations/vendors.md#c-ownership-integration-and-cost); Omny's price is not published, so it is
   **unknown**). Most of the custom figure is three always-on nodes, which don't grow with traffic.
   Adding 63 hours a month of people time widens the gap. This confirms the pitch's warning: the build
   does not win on hosting cost.
3. **At 100k downloads, egress is the cost.** With $0.09/GB egress, egress is 69% of the known total
   ($1,128 of $1,635). With a zero-egress store, the same traffic costs $245. The provider's egress
   price matters more than any other input, so pitch §10's "limit renditions and retention" and the
   CDN choice in P1-11 are the levers. Video roughly doubles delivery bytes at these assumptions.
4. **Retained masters and backups outweigh delivery files.** In `pilot`, the masters (376 GB, of which
   324 GB is video) and their backup copy (376 GB) are 82% of the 920 GB stored. Retired versions under ADR 0006's 90-day
   retention add only 3.5–14 GB, so retention is not a material cost at a 10% correction rate.
5. **Leaving a provider is cheap in bytes but not free.** Moving everything stored costs one full egress
   of the stored set: $83 (pilot) to $334 (scale) at $0.09/GB, or $0 from a zero-egress store. Time,
   manual steps, and verification were measured by the P0-07 local rehearsal: 1 GiB in 9m 19s with 0
   manual steps. That was local, not between providers.

## What is included

| Pitch §9 / P0-08 cost item        | Where it is                                                                                                  |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Audio and video delivery          | `billed_delivery_tb` × `egress_gb`; `cost_edge` if a CDN sits in front (unknown)                             |
| Request charges                   | GETs (downloads, HLS segments, feed polls) and PUTs (multipart parts, segments), including corrections       |
| Masters and renditions            | `storage_audio_masters_gb`, `storage_video_masters_gb`, `storage_video_renditions_gb`; masters are immutable |
| Retention of retired versions     | `storage_retired_versions_gb` (ADR 0006 V8: 90 days)                                                         |
| Replication and backups           | `storage_replication_factor`, `master_backup_copies`, `db_backup_multiplier`                                 |
| Log and observability storage     | `storage_logs_gb`, `storage_observability_gb`                                                                |
| Transcoding and transcription     | `cpu_hours_*` → `instance_hours` × `instance_hour`. The hosted transcription price is unknown (A8)           |
| Database                          | `storage_db_and_backups_gb`. It runs in-cluster on CNPG, so compute is inside the node cost                  |
| Inter-provider transfer           | `oneoff_migration_*`: one full egress of everything stored                                                   |
| Engineering and operations effort | `engineering_`, `operations_`, `moderation_support_hours_month` → `people_hours_month` × `labour_rate_hour`  |
| Contingency                       | `contingency_fraction` of the known infrastructure subtotal                                                  |

## Unknown is not zero

| Unknown                          | Why                                                                                                          |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Edge / CDN delivery              | No CDN is chosen (P1-11 defines the adapter). An edge can replace or add to origin egress                    |
| Kubernetes control plane         | Depends on the provider, or on self-running it                                                               |
| People cost for `pilot`, `scale` | A network's fully loaded rate was not supplied (pitch §9). The hours are reported so any rate can be applied |
| Hosted transcription             | The provider is not chosen (P1-07 asks the owner). The model uses self-hosted compute                        |
| Omny Studio (buy option)         | The price is not published (P0-03)                                                                           |

The compute factors (`*_cpu_h_per_media_h`) are **assumptions**. The review report requires a
representative hardware benchmark. They are replaced by measurements in P1-06 (audio), P1-07
(transcription), and P2-01 (video). At these volumes, even a 10× error moves batch compute by less than
$35 a month, so no gate decision depends on them. They matter more for laptop wall-clock time.

## Limits

- It is a usage model. Partial downloads, player prefetch, caching, and retries change actual traffic;
  `audio_delivered_fraction` and `delivery_overhead_factor` are the knobs.
- `pilot` and `scale` describe a hypothetical network. Relay has no audience (D1), and nothing here is a
  revenue or ROI claim. See [phase-0.md](phase-0.md#demonstration-value-versus-commercial-roi).
- The price sets are illustrative list prices on one date. Re-check them before any real spend.
