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
  // hover: styles only apply on devices that can hover, so they never
  // stick after a tap on phones (mobile-native skill §1).
  future: { hoverOnlyWhenSupported: true },
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
        // All application colours resolve to globals.css semantic variables.
        // Legacy brand aliases keep existing components compatible.
        brand: {
          primary: "hsl(var(--primary) / <alpha-value>)",
          hover: "hsl(var(--primary-hover) / <alpha-value>)",
          plum: "hsl(var(--brand-plum) / <alpha-value>)",
          coral: "hsl(var(--connection) / <alpha-value>)",
          "coral-deep": "hsl(var(--connection-emphasis) / <alpha-value>)",
          gold: "hsl(var(--growth) / <alpha-value>)",
          "gold-deep": "hsl(var(--growth-emphasis) / <alpha-value>)",
          "coral-soft": "hsl(var(--connection-subtle) / <alpha-value>)",
          "gold-soft": "hsl(var(--growth-subtle) / <alpha-value>)",
          quiet: "hsl(var(--muted) / <alpha-value>)",
          light: "hsl(var(--popover) / <alpha-value>)",
          linen: "hsl(var(--background) / <alpha-value>)",
          ivory: "hsl(var(--background) / <alpha-value>)",
          parchment: "hsl(var(--card) / <alpha-value>)",
          stone: "hsl(var(--card) / <alpha-value>)",
          card: "hsl(var(--card) / <alpha-value>)",
          espresso: "hsl(var(--inverse) / <alpha-value>)",
          taupe: "hsl(var(--muted-foreground) / <alpha-value>)",
          mauve: "hsl(var(--brand-mauve) / <alpha-value>)",
          growth: "hsl(var(--growth) / <alpha-value>)",
          sand: "hsl(var(--growth) / <alpha-value>)",
          border: "hsl(var(--border) / <alpha-value>)",
          "text-primary": "hsl(var(--foreground) / <alpha-value>)",
          "text-secondary": "hsl(var(--muted-foreground) / <alpha-value>)",
          "warm-highlight": "hsl(var(--growth) / <alpha-value>)",
          destructive: "hsl(var(--destructive) / <alpha-value>)",
        },
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        shadow: "hsl(var(--shadow) / <alpha-value>)",
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
          hover: "hsl(var(--primary-hover) / <alpha-value>)",
          emphasis: "hsl(var(--primary-emphasis) / <alpha-value>)",
          100: "hsl(var(--background) / <alpha-value>)",
          200: "hsl(var(--card) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
          emphasis: "hsl(var(--destructive-emphasis) / <alpha-value>)",
          subtle: "hsl(var(--destructive-subtle) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
        },
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover) / <alpha-value>)",
          foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
        },
        connection: {
          DEFAULT: "hsl(var(--connection) / <alpha-value>)",
          foreground: "hsl(var(--connection-foreground) / <alpha-value>)",
          emphasis: "hsl(var(--connection-emphasis) / <alpha-value>)",
          subtle: "hsl(var(--connection-subtle) / <alpha-value>)",
        },
        growth: {
          DEFAULT: "hsl(var(--growth) / <alpha-value>)",
          foreground: "hsl(var(--growth-foreground) / <alpha-value>)",
          emphasis: "hsl(var(--growth-emphasis) / <alpha-value>)",
          subtle: "hsl(var(--growth-subtle) / <alpha-value>)",
        },
        success: {
          DEFAULT: "hsl(var(--success) / <alpha-value>)",
          foreground: "hsl(var(--success-foreground) / <alpha-value>)",
          emphasis: "hsl(var(--success-emphasis) / <alpha-value>)",
          subtle: "hsl(var(--success-subtle) / <alpha-value>)",
        },
        warning: {
          DEFAULT: "hsl(var(--warning) / <alpha-value>)",
          foreground: "hsl(var(--warning-foreground) / <alpha-value>)",
          emphasis: "hsl(var(--warning-emphasis) / <alpha-value>)",
          subtle: "hsl(var(--warning-subtle) / <alpha-value>)",
        },
        inverse: {
          DEFAULT: "hsl(var(--inverse) / <alpha-value>)",
          foreground: "hsl(var(--inverse-foreground) / <alpha-value>)",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background) / <alpha-value>)",
          foreground: "hsl(var(--sidebar-foreground) / <alpha-value>)",
          primary: "hsl(var(--sidebar-primary) / <alpha-value>)",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground) / <alpha-value>)",
          accent: "hsl(var(--sidebar-accent) / <alpha-value>)",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground) / <alpha-value>)",
          border: "hsl(var(--sidebar-border) / <alpha-value>)",
          ring: "hsl(var(--sidebar-ring) / <alpha-value>)",
        },
        understand: {
          DEFAULT: "hsl(var(--primary-emphasis) / <alpha-value>)",
        },
        insight: {
          DEFAULT: "hsl(var(--growth) / <alpha-value>)",
          emphasis: "hsl(var(--growth-emphasis) / <alpha-value>)",
          subtle: "hsl(var(--growth-subtle) / <alpha-value>)",
          foreground: "hsl(var(--growth-foreground) / <alpha-value>)",
        },
        calm: {
          DEFAULT: "hsl(var(--calm) / <alpha-value>)",
          emphasis: "hsl(var(--calm-emphasis) / <alpha-value>)",
          subtle: "hsl(var(--calm-subtle) / <alpha-value>)",
        },
      },
      // Fills and readable text have different roles: coral/gold fills stay
      // bright, while their words use accessible emphasis variants.
      textColor: {
        brand: {
          primary: "hsl(var(--primary-emphasis) / <alpha-value>)",
          hover: "hsl(var(--primary-emphasis-hover) / <alpha-value>)",
          espresso: "hsl(var(--foreground) / <alpha-value>)",
          mauve: "hsl(var(--muted-foreground) / <alpha-value>)",
          coral: "hsl(var(--connection-emphasis) / <alpha-value>)",
          gold: "hsl(var(--growth-emphasis) / <alpha-value>)",
          sand: "hsl(var(--growth-emphasis) / <alpha-value>)",
          growth: "hsl(var(--growth-emphasis) / <alpha-value>)",
          destructive: "hsl(var(--destructive-emphasis) / <alpha-value>)",
        },
        primary: { DEFAULT: "hsl(var(--primary-emphasis) / <alpha-value>)" },
        connection: { DEFAULT: "hsl(var(--connection-emphasis) / <alpha-value>)" },
        growth: { DEFAULT: "hsl(var(--growth-emphasis) / <alpha-value>)" },
        insight: { DEFAULT: "hsl(var(--growth-emphasis) / <alpha-value>)" },
        destructive: { DEFAULT: "hsl(var(--destructive-emphasis) / <alpha-value>)" },
        success: { DEFAULT: "hsl(var(--success-emphasis) / <alpha-value>)" },
        warning: { DEFAULT: "hsl(var(--warning-emphasis) / <alpha-value>)" },
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
