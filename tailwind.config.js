/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Apple heavily relies on strict, clean sans-serifs completely
      },
      colors: {
        appleBlue: '#007AFF', // System blue replacement
        brand: {
          primary: "#8B5CF6",   // Soft violet — pastel periwinkle-purple
          hover: "#7C3AED",     // Violet-600 — hover state
          light: "#FAF9FF",     // Barely-there lavender white
          linen: "#F5F3FF",     // Soft lavender page background
          parchment: "#EDE9FE", // Lavender card surfaces
          card: "#EDE9FE",      // Alias for parchment
          espresso: "#2E1065",  // Deep violet near-black for headings
          sand: "#F9C74F",      // Butter gold for highlights/streaks
          taupe: "#6B5B9E",     // Muted purple for secondary text
          growth: "#93C5FD",    // Soft sky blue for progress
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
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
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
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
    },
  },
  plugins: [],
} 