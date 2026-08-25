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
        // Warm Clay system (Master PRD §6 + color-theory reconciliation).
        // Warm analogous core (clay → gold) + one cool counterweight (sage),
        // anchored by warm espresso. Replaces the violet direction that had
        // drifted in as a third, unreconciled palette — note the old
        // "parchment" was #EEE7F8, a LAVENDER, which silently broke the
        // whole warm intent. Gold is rationed: milestones/streak only.
        brand: {
          primary: "#C56B4D",        // Warm Clay — CTA/action
          hover: "#A85539",          // Clay, pressed
          light: "#FBF8F3",
          linen: "#F5F1EA",          // warm canvas
          parchment: "#EFE7DC",      // warm raised surface
          card: "#EFE7DC",
          espresso: "#2E2620",       // warm dark anchor (never cold black)
          taupe: "#6B5F52",          // warm secondary text
          growth: "#9CB5A0",         // Sage — calm/grounding, growth metaphor
          sand: "#D9A441",           // Rationed Gold — milestones only
          border: "#E2D9CC",
          "text-primary": "#2E2620",
          "text-secondary": "#6B5F52",
          "warm-highlight": "#D9A441",
          destructive: "#C95B6A",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#C56B4D",
          foreground: "#FFFFFF",
          100: "#F5F1EA",
          200: "#EFE7DC",
        },
        secondary: {
          DEFAULT: "#EFE7DC",
          foreground: "#2E2620",
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
