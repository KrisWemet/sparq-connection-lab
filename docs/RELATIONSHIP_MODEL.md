# Relationship Model & Private/Shared Boundary

**Constitution steps:** §14.7 · implements §7, §8, §12
**Migration:** `supabase/migrations/20260930130000_relationship_model.sql`
**Boundary check:** `supabase/tests/rls_boundaries.sql` (rolls itself back; last run 2026-09-30, all blocked as expected)

Core question (§7): *what happens between these two people, and where does each person have agency?*

## Layers

| Layer (§7) | Where | Who can read | Who can write |
|---|---|---|---|
| **Me & You** — each partner's Person Model | `profile_traits`, `memories`, `self_discoveries`, `experiments`, `reflections`, `daily_sessions`, … | Owner only (RLS `auth.uid() = user_id`) | Owner only |
| **Us** — shared values, rituals, agreements, memories, discoveries a partner chose to share | `shared_items` in a `couple_spaces` row | Both members | Author only (insert/delete); never edited by the other |
| **Interaction cycles** — pursue/withdraw, missed bids… named without blame | `interaction_cycles` | Both members | Both members; a cycle is **confirmed only when both** have confirmed it |
| **Connection & Repair** | `interaction_cycles.what_helps` + `shared_items` kind `repair` | Both | Both |
| **Relationship trajectory** | Derived at read time from `shared_items` / confirmed cycles over time | Both | — |

## Rules (enforced in data access, not prompts — §12)

1. **Nothing crosses from private to shared without an explicit action by its author.** The only way into `shared_items` is an insert where `author_id = auth.uid()`.
2. **A couple space exists only for a mutual link.** `ensure_couple_space()` (SECURITY DEFINER, only acts on the caller's own link) checks that both profiles point at each other. Clients cannot insert spaces.
3. **Private knowledge may shape how Peter helps a user communicate; it never becomes something Peter says *for* them** (§8). Shared-space code paths use only `shared_items` and cycles.
4. **Both perspectives survive.** Items are authored, never merged; Shared Peter facilitates, it doesn't decide whose account is true.

## Removed in this step

- **Automatic partner synthesis** (`daily/session/complete.ts`): blended both partners' private evening reflections into shared text with no explicit sharing. (It never actually ran — RLS blocked reading the partner's session — but the design violated §8.) `partner_syntheses` is deprecated.
- **`/api/profile/traits?include_partner=true`**: returned a partner's private trait hypotheses to the other partner (also blocked by RLS in practice). The response now always carries an empty `partner_traits`.

## API

- `GET/POST/DELETE /api/couple` — shared space and items (kinds: discovery, appreciation, need, value, ritual, agreement, memory, repair).
- `POST/PATCH /api/couple/cycles` — propose a cycle; confirm or retire it.
