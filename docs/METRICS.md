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

Constitution v1.2 §10 adds measures of lived change. **Instrumented 2026-10-01** as `public.transformation_metrics(window_days)` (migration `20261001100000_transformation_engine.sql`, not yet applied) → `GET /api/admin/kpis` (`transformation` block) → Admin → Discovery → *Lived change*. Same rules: aggregate counts only, never optimized directly, agreement with Peter is never a metric.

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
