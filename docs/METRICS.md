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
