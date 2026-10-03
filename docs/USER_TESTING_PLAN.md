# Structured User Testing Plan

**Constitution step:** §14.10 — "Run structured user testing before broadening the feature surface."
**Owner:** Chris (needs real people — this can't be automated). Everything it tests is built and live.

## Goal

Find out whether the constitutional layer actually does what the constitution promises — before adding anything new:

> Does this help the user understand themselves, exercise agency, improve how they show up in relationships, and trust SPARQ more over time?

## Who

- **5–8 couples** (10–16 people), committed, not in crisis — the primary user in `CLAUDE.md`.
- Mix: 2–3 couples where both partners use Sparq, 2–3 where only one does.
- Screen out: active crisis, recent infidelity disclosure, anyone who'd use it to build a case against a partner.
- Consent: explain that sessions are observed, that Peter is AI, and what is stored (Trust Center). Offer delete-all at the end.

## Format

Two waves, same people:

| Wave | When | Format | Length |
|---|---|---|---|
| **1 — First week** | Days 0–7 | Moderated session on day 0 (think-aloud), then 7 days unmoderated, then a 30-min interview on day 8 | ~2 h per person over the week |
| **2 — First month** | Days 8–30 | Unmoderated; short check-in on day 15; 45-min interview on day 31 | ~1.5 h per person |

## Tasks to observe (think-aloud, day 0)

1. Sign up and go through onboarding. *Watch:* where they hesitate; whether they use "I'd rather not say yet"; how the first Peter guess lands ("tell me if I'm off").
2. First evening check-in. *Watch:* does Peter ask one question at a time; does he stop when they've seen something true?
3. In chat, tell Peter something frustrating about your partner using "always" or "never". *Watch:* does the Challenge feel curious or judgmental?
4. Find your guesses in Journal and correct one ("not really"). *Watch:* can they find it; do they feel in control?
5. Write one experiment of your own.
6. (Linked couples) Share one thing into Us, then ask Shared Peter for a question.

## Measures

**Behavior (from `/admin` → Discovery, `docs/METRICS.md`):** Meaningful Discovery Rate, experiment follow-through, correction rate, mirror usefulness, shares per couple, 7/30-day return.

**Interview (same questions both waves, 1–5 scale plus "tell me about that"):**

| Constitution promise | Question |
|---|---|
| Discovery before direction (§2) | "When Peter helped, did it feel like you figured it out, or like he told you?" |
| Hypotheses, not diagnoses (§2) | "Did Peter ever say something about you that felt like a label? What did you do?" |
| Agency (§2, §5) | "Name one thing you chose to try. Whose idea was it?" |
| The cycle, not the partner (§2, §7) | "Did anything make you feel judged, or like Peter took a side?" |
| Privacy (§8) | "What do you think your partner can see of what you wrote? How sure are you?" *(check the answer against reality)* |
| Memory feels right (§4) | "Did Peter remember something that mattered? Anything he shouldn't have?" |
| Growth proof (§11) | Day 31: "What does your 30-day mirror say to you? Is it true?" |
| No dependence (§10) | "Do you notice your own patterns more than before, with or without the app?" |
| *v1.2, when missions ship:* Real-world practice (§11A) | "Did you try anything out in your life because of Sparq? What happened?" |
| *v1.2:* Destination is yours (§5A) | "Did Sparq ever feel like it was pushing you toward a decision you hadn't made?" |
| *v1.2:* Setbacks are data (§11A) | "When something didn't go to plan, how did Sparq make you feel about it?" |

## Red flags that stop broadening the feature surface

- Anyone believes their partner can see private writing (privacy trust broken — fix copy/UI first).
- Correction rate > 40% (inference is guessing badly — review `profile-analysis.ts`).
- People describe Peter as "telling me who I am" or "taking sides".
- Experiment follow-through < 20% (experiments feel like homework).
- Mirror usefulness < 30% (the mirror question isn't landing).

## After each wave

Write findings into `docs/USER_TESTING_FINDINGS.md` (what we saw → which constitution section → proposed change). Only then pick the next build slice.
