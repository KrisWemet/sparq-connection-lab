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

---

## v1.2 transformation metrics (conceptual — not yet instrumented)

Constitution v1.2 §10 adds measures of whether *lived change* is happening, alongside the metrics above. Same rules: admin-only, aggregate counts, no user content, never optimized at the user's expense. **Agreement with Peter is never a success metric.**

| Metric | Conceptual definition | Data it needs (see `PERSON_MODEL.md` §9) |
|---|---|---|
| User-originated conclusion share | self-discoveries with `origin = user_led` ÷ all self-discoveries | `self_discoveries.origin` (§8.4) |
| User-originated mission share | missions with `suggested_by = user` ÷ all missions | `experiments.suggested_by` |
| Missions created → attempted → reflected | three counts per active user-week; "attempted" = `status = tried`; "reflected" = resolved (`tried`/`skipped`/`let_go`) with an `outcome_note` | existing `experiments` + outcome vocabulary |
| Real-world behavior change | growth moments citing repeated mission outcomes in the same practice | `growth_moments` + `practice_key` |
| Identity alignment | consistent ÷ (consistent + inconsistent) identity evidence, per user over time — a trend for the user's own mirror, reported to admins only in aggregate | `growth_moments.direction` |
| Repair attempts | missions/shared items of kind repair | `practice_key`, `shared_items.kind = repair` |
| Growth after setbacks | users who record a setback and later attempt or adapt a mission in the same practice ÷ users with a setback | outcome + adaptation |
| Increasing agency | trend of user-originated shares, self-designed missions and user-initiated commitment revisions over a user's tenure | as above + `user_reasons.revised_at` |
| Contribution behaviors | missions or reasons with a `beneficiary` beyond the user, *only* among users who chose to explore contribution | `beneficiary` |
| Return after a break | users who come back after ≥7 days away and complete a session — success, not churn recovery | `daily_sessions` |

**Guardrails.** Time in app and message count are not success metrics. A user who needs Peter less over time, or who designs their own missions without asking, counts as success. Per-user values are shown only to that user, as evidence in their own mirrors — never ranked, compared or shared.
