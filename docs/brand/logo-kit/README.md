# Sparq logo kit

The Spark Between: two halves of one spark, split by an S. See `GUIDELINES.md` for how to use it.

## Folders

| Folder | What's in it |
|---|---|
| `lockups/` | `sparq-<app>-<horizontal\|stacked>-<scheme>.svg` for `connection`, `within`, `family`; `sparq-wordmark-*.svg` |
| `symbol/` | `sparq-<app>-symbol-<scheme>.svg`; `sparq-symbol-small-*.svg` (plain spark for <32 px) |
| `png/` | Transparent PNGs of every lockup (1200 px wide horizontal, 800 px stacked) and symbol (1024 px) |
| `app-icon/` | 1024 px app icon: full-bleed square for app stores, rounded preview, Android maskable (SVG + PNG) |
| `web/` | `favicon.ico` (16/32/48), `favicon.svg`, favicon PNGs, `apple-touch-icon.png`, `icon-192/512.png`, `icon-maskable-512.png`, `site.webmanifest`, `head-snippet.html` |
| `presentation/` | `board.png` (overview, mockups, recommendation) and its source |

**Schemes:**
- `colour`: coral and plum halves, plum wordmark, for light backgrounds.
- `reversed`: coral and linen halves, linen wordmark, for plum.
- `plum`: one colour.
- `ink`: one colour, near-black.
- `white`: one colour, for dark backgrounds.

## Build notes

- **All artwork is outlines.** There's no live text, and no masks, filters or embedded images.
- **The Connection and Within marks are exact geometry:** a few arcs plus one curve per half.
- **The Family split** is cut with a geometry library and simplified (~200 points). It looks the same, but it's
  heavier to edit by hand.
- **Fonts:** Cormorant Garamond Bold (© The Cormorant Project Authors) and Inter Medium (© The Inter Project
  Authors), SIL Open Font License 1.1. The fonts aren't included; the wordmark is outlined.
- **Not done yet:** print PDF/EPS files, Pantone matching, and a trademark search.
