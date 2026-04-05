import type { Config } from "tailwindcss";

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
        brand: {
          primary: "#8B5CF6",   // Soft violet — pastel periwinkle-purple
          hover: "#7C3AED",     // Violet-600 — hover state
          light: "#FAF9FF",     // Barely-there lavender white
          linen: "#F5F3FF",     // Soft lavender page background
          parchment: "#EDE9FE", // Lavender card surfaces
          card: "#EDE9FE",      // Alias for parchment
          espresso: "#2E1065",  // Deep violet near-black for headings
          sand: "#F9C74F",      // Butter gold for highlights/streaks (pastel amber)
          taupe: "#6B5B9E",     // Muted purple for secondary text
          growth: "#93C5FD",    // Soft sky blue for progress
        },
        amethyst: {
          50:  '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
        },
        gold: {
          100: '#FEF3C7',
          400: '#FBBF24',
          500: '#F59E0B',
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#8B5CF6",
          foreground: "#FFFFFF",
          100: "#FAF9FF",
          200: "#EDE9FE",
        },
        secondary: {
          DEFAULT: "#EDE9FE",
          foreground: "#2E1065",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
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
        serif: ['var(--font-serif)', 'ui-serif', 'Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
      },
    },
  },
  safelist: [
    { pattern: /^bg-amethyst-/ },
    { pattern: /^text-amethyst-/ },
    { pattern: /^border-amethyst-/ },
    { pattern: /^ring-amethyst-/ },
    { pattern: /^from-amethyst-/ },
    { pattern: /^to-amethyst-/ },
    { pattern: /^bg-gold-/ },
    { pattern: /^text-gold-/ },
  ],
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
