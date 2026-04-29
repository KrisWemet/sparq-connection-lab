# Deferred Items

- `Translator` flow still emits a React warning about an unexpected `fetchPriority` prop on a DOM element during local dev. This appeared while running the Wave 2 Playwright gate and is outside the files touched by `20-02`.
- Several routes still request `/sparq-mascot.png` as an invalid image resource during local dev. This appeared during the same verification run and is unrelated to the editorial UI files changed in `20-02`.
