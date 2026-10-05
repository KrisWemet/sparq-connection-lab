# Discovery Metrics

**Constitution steps:** §14.9 · implements §10, §12 ("instrument discovery, experiment follow-through, corrections, mirror usefulness and retention")
**Where:** `public.discovery_metrics(window_days)` (migration `20260930140000_discovery_metrics.sql`) → `GET /api/admin/kpis` (`discovery` block) → Admin → **Discovery** tab.

Admin-only, **aggregate counts only** — no user content ever leaves the database through these metrics.

| Metric | Definition |
|---|---|
| **Meaningful Discovery Rate** | (self-discoveries + experiments created + experiments tried + growth moments surfaced) ÷ active user-weeks. Active user-week = a user with ≥1 completed daily session that week. |
| Experiment follow-through | tried ÷ (tried + let go/skipped + planned >3 days past check-in) |
| Correction rate | guesses the user rejected ÷ (confirmed + rejected). High = Peter's guesses miss; a healthy sign of agency, but a signal to review inference. |
| Mirror usefulness | weekly mirrors the user answered ÷ mirrors generated |
| Items shared by couples | explicit shares into `shared_items` |
| Own reasons given | reasons users wrote in their own words (`user_reasons`) |
| Own-reason rate | experiments that carry the user's own reason ÷ experiments created — a §10 influence-health signal (self-persuasion). Higher is healthier; it is never pushed by Peter supplying reasons. |
| Retention (existing) | `retention_rate_30d` in the same KPI response |

MDR complements, never replaces, retention and product-health metrics (§10). Avoid optimizing it directly — a user who needs Peter less over time is success (§10 "avoid designing dependence").

Events also logged to `analytics_events`: `mirror_reflected`, `experiment_created`, `experiment_resolved`, `shared_item_created`, `thirty_day_mirror_concluded`.

Fixed along the way: `/api/admin/kpis` called `is_admin` with the wrong parameter name (`user_id` instead of `check_user_id`) and therefore always returned 403.

## v1.2 transformation metrics

Constitution v1.2 §10 adds measures of lived change. **Instrumented 2026-10-01** as `public.transformation_metrics(window_days)` (migration `20261001100000_transformation_engine.sql`, applied 2026-10-01) → `GET /api/admin/kpis` (`transformation` block) → Admin → Discovery → *Lived change*. Same rules: aggregate counts only, never optimized directly, agreement with Peter is never a metric.

Implemented definitions: **missions tried**; **reflection rate** = resolved missions with a `learning` entry ÷ resolved; **setbacks** = skipped + let go + revised; **adaptation rate** = revised ÷ setbacks; **persistence after setback** = setbacks that were revised or followed by a new attempt within 14 days ÷ setbacks; **user-designed share** = missions not taken from an idea ÷ all; **identity steps** = consistent `identity_evidence`; **Deep Whys** = North Stars with a `deep_why` chain; **chapters** = `growth_arcs`; **missions reaching others** = domain family/friends/work/community. Not yet instrumented from the table below: user-originated insight share (needs `self_discoveries.origin`), identity alignment self-report, repair attempts.

Events added to `analytics_events`: `identity_step_linked`, `identity_question_answered`, `growth_arc_marked`; `experiment_created` / `experiment_resolved` now carry domain, skill, felt and what got in the way.

| Metric (draft definition) | Likely source |
|---|---|
| **User-originated insight share** — self-discoveries with `origin = user_led` ÷ all self-discoveries | `self_discoveries.origin` (PERSON_MODEL §8.4) |
| **Missions attempted** — missions/experiments `tried` per active user-week | `experiments` (`kind`) |
| **Reflection rate** — tried or skipped missions with a learning note ÷ resolved missions | `experiments.learning` |
| **Adaptation rate** — missions revised (`revised_from`) after a setback ÷ setbacks | `experiments` |
| **Growth persistence after setbacks** — users who try another mission within 14 days of a skipped/let-go one | `experiments` |
| **Real-world change evidence** — growth moments + identity evidence (consistent) per active user-month | `growth_moments`, identity evidence |
| **Identity alignment (self-report)** — periodic "How much did you live like the person you want to be this week?" (1–5) | mirror question |
| **Repair attempts** — user-reported repair missions/reflections | missions with `skill_key` repair, `shared_items` kind `repair` |
| **Agency trend** — share of missions the user designed vs. accepted from Peter, over time (rising is healthy) | `experiments.origin`, `accepted_from_suggestion` |
| **Contribution behaviors** — missions with a `domain` beyond self/partner, only for users who chose contribution | `experiments.domain` |

## Outcome measurement (2026-10-05)

**What changed and why.** The old `relationship-score.ts` produced a weighted 0–100 "Relationship OS Score": communication quality from reflection *length* and Peter *usage*, emotional safety from an *inferred* mood minus logged safety events, repair from logged minutes-to-resolve. None of those measure what the names say, and fewer Peter conversations lowered the score — the opposite of §10. It was never shown to users. It is retired: `src/lib/server/relationship-score.ts`, `/api/me/relationship-score` and the admin average are removed. Historical `relationship_scores` rows are kept in the database and in the user's data export; nothing writes new ones.

**Three layers, never combined into one number** (`src/lib/server/progress-summary.ts`, `GET /api/me/progress-summary`):

| Layer | What it is | What it is not |
|---|---|---|
| **Practice activity** | Days practiced, reflections written, missions tried and adapted | Not an outcome. More use ≠ better communication; a longer reflection ≠ a better relationship; using Sparq less can go with things going well |
| **The user's own answers** | CSI-4 and the informal check-in, before and after | Not proof Sparq caused a change. Reported as "your answers went up / stayed the same / went down", never as success or failure |
| **Tentative patterns** | Growth moments the engine noticed in what the user wrote | Guesses the user can correct; not scores |

**Interpretation rules** (apply to copy, Peter context and admin views):

- More app usage does not establish better communication.
- Longer reflections do not establish relationship improvement.
- No logged safety event does not establish safety; asking for help is never counted against anyone.
- An inferred mood does not establish emotional safety.
- Fewer conversations with Peter can accompany improvement.
- Faster logged reconciliation alone does not establish good repair — repair quality is the user's own report.
- Individual answers are private to the user (RLS: owner only). They are never compared with a partner, shown to Peter, or used to diagnose.

### Relationship satisfaction — CSI-4

`src/lib/csi4.ts` holds the 4-item Couples Satisfaction Index **with its published wording, anchors and scoring** (items 1, 12, 19, 22 of the CSI-32; item 1 scored 0–6, the others 0–5, total 0–21, kept continuous). Source: Funk, J. L., & Rogge, R. D. (2007), *Testing the ruler with item response theory*, Journal of Family Psychology 21(4), 572–583. Until 2026-10-05 Sparq showed paraphrased items and anchors (e.g. the anchor scored 3 read "Even" instead of "Happy"), so earlier `csi_pulses` rows were answered on different wording; treat before/after pairs that straddle that date with caution.

- **Population fit:** developed and validated with adults in romantic relationships (married, cohabiting, dating) — Sparq's users. It measures global satisfaction only, not communication, safety or repair.
- **Permissions:** the authors publish the CSI scales as freely available for research and clinical use with no further permission needed. **Open for Chris:** use inside a commercial consumer app is not explicitly covered — confirm with the authors before paid launch.
- **No cut-off is shown to users.** The published distress cut-off is for research screening; Sparq never labels a relationship as distressed.
- Where it appears: onboarding baseline (`CsiBaseline`), the monthly dashboard pulse (`CsiPulseCard`, with "Not now"), the Day-14 before/after (`CsiTrajectoryCard`). All optional.

### Informal check-in — Sparq's own questions

`src/lib/check-in.ts` — **clearly labelled as Sparq's own, not a standard scale.** Asked optionally right after the CSI-4 (each question skippable, the whole set declinable). Stored per user in `outcome_assessments` (`milestone` `checkin_baseline` / `checkin_follow_up`, `responses.answers`, `total_score` unused). No total is ever computed.

| Key | Question (abridged) | Answers |
|---|---|---|
| `goal_progress` | How close are things to what you want to be different? | Far off → Pretty much there (0–3) |
| `heard_respected` | Last two weeks: how often did you feel heard and respected? | Rarely → Almost always (0–3) |
| `hard_topics` | …talk about something hard without it going badly? | Rarely → Almost always (0–3), or "No hard talks came up" |
| `repair` | After the last fight, how well did you find your way back? | Not well → Well (0–3), or "No fight lately" |
| `practice_fit` (follow-up only) | How have the things you practiced felt? | Useful / Okay / A burden / Not helpful / Haven't tried any |

Then → now is shown item by item in the user's own words (`CsiTrajectoryCard`), with "a change in your answers shows what you reported, not proof of what caused it." Rating scales are the one place Sparq shows more than three options; they are an ordered answer, not a menu of choices (language framework §4).

**Admin:** `GET /api/admin/kpis` reports only how many check-ins were saved (`check_ins_saved`). Answers are never aggregated into a score.

**Not yet done:** a "practice feels like a burden / not helpful" answer does not yet change which practices are suggested — that link belongs to the practice-consistency slice (Phase 3).
