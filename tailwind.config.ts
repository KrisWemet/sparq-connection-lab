import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Plum / Coral / Gold system (2026-09-30, Chris). Colour carries meaning:
        //   plum = understand (everyday brand, buttons), coral = connect,
        //   gold = grow (insight, milestones). Coral and gold are fills and
        //   accents only — for text use coral-deep / gold-deep (AA on ivory
        //   and stone). White text never sits on coral or gold.
        brand: {
          primary: "#4B2E57",        // Deep Plum — primary brand, buttons (white text 11.5:1)
          hover: "#3A2244",          // Plum, pressed — also small accent text
          plum: "#4B2E57",
          coral: "#E97868",          // Warm Coral — connection moments (fill; dark-plum text on it)
          "coral-deep": "#A8452F",   // coral for text/icons (5.5:1 on ivory)
          gold: "#F3B55A",           // Soft Gold — reward / insight (fill; dark-plum text on it)
          "gold-deep": "#8A5E14",    // gold for text/icons (5.3:1 on ivory)
          // Moment tints (src/lib/moment-tone.ts) — dark-plum text ≈14:1 on each.
          "coral-soft": "#FCEBE7",   // connect moments
          "gold-soft": "#FDF2DF",    // grow moments
          quiet: "#F3F0F1",          // repair / hard moments — less colour
          light: "#FFFDFA",
          linen: "#FAF7F2",          // Warm Ivory — background
          ivory: "#FAF7F2",
          parchment: "#EEE8E3",      // Soft Stone — cards / surfaces
          stone: "#EEE8E3",
          card: "#EEE8E3",
          espresso: "#241D27",       // Dark Plum — main text
          taupe: "#685C6A",          // Muted Mauve — secondary text (5.2:1 on stone)
          mauve: "#685C6A",
          growth: "#9CB5A0",         // Sage — calm/grounding (repair, quiet moments)
          sand: "#F3B55A",           // legacy name for gold
          border: "#DED5CF",
          "text-primary": "#241D27",
          "text-secondary": "#685C6A",
          "warm-highlight": "#F3B55A",
          destructive: "#C95B6A",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#4B2E57",
          foreground: "#FFFFFF",
          100: "#FAF7F2",
          200: "#EEE8E3",
        },
        secondary: {
          DEFAULT: "#EEE8E3",
          foreground: "#241D27",
        },
        destructive: {
          DEFAULT: "#C95B6A",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "slide-up": {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "slide-down": {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "slide-left": {
          "0%": { transform: "translateX(10px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "slide-right": {
          "0%": { transform: "translateX(-10px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "slide-up": "slide-up 0.3s ease-out",
        "slide-down": "slide-down 0.3s ease-out",
        "slide-left": "slide-left 0.3s ease-out",
        "slide-right": "slide-right 0.3s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
      },
      fontFamily: {
        sans: ["var(--font-sans)", ...defaultTheme.fontFamily.sans],
        serif: [
          "var(--font-serif)",
          ...defaultTheme.fontFamily.serif,
        ],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
