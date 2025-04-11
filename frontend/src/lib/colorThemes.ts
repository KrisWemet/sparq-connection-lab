// src/lib/colorThemes.ts

export type ThemeColors = {
  primary: string;
  secondary: string;
  accent: string;
  highlight: string;
  cardGradient: string;
  featureGradient: string;
  textPrimary: string;
  textSecondary: string;
  textAccent: string;
  borderAccent: string;
  bgSubtle: string;
};

export const colorThemes: Record<string, ThemeColors> = {
  azure: {
    primary: "bg-blue-600",
    secondary: "bg-slate-700",
    accent: "bg-emerald-700",
    highlight: "bg-amber-600",
    cardGradient: "from-slate-700 to-slate-600",
    featureGradient: "from-blue-700 to-blue-600",
    textPrimary: "text-blue-600",
    textSecondary: "text-slate-700",
    textAccent: "text-emerald-700",
    borderAccent: "border-blue-600",
    bgSubtle: "bg-blue-50",
  },
  rose: {
    primary: "bg-rose-400",
    secondary: "bg-violet-400",
    accent: "bg-teal-400",
    highlight: "bg-amber-400",
    cardGradient: "from-violet-400 to-violet-300",
    featureGradient: "from-rose-400 to-rose-300",
    textPrimary: "text-rose-400",
    textSecondary: "text-violet-400",
    textAccent: "text-teal-400",
    borderAccent: "border-rose-400",
    bgSubtle: "bg-rose-50",
  },
  indigo: {
    primary: "bg-indigo-500",
    secondary: "bg-purple-500",
    accent: "bg-cyan-500",
    highlight: "bg-amber-500",
    cardGradient: "from-indigo-500 to-indigo-400",
    featureGradient: "from-purple-500 to-purple-400",
    textPrimary: "text-indigo-500",
    textSecondary: "text-purple-500",
    textAccent: "text-cyan-500",
    borderAccent: "border-indigo-500",
    bgSubtle: "bg-indigo-50",
  },
  rainbow: {
    primary: "bg-gradient-to-r from-red-500 via-yellow-500 to-green-500",
    secondary: "bg-gradient-to-r from-blue-500 to-purple-500",
    accent: "bg-gradient-to-r from-pink-500 to-orange-500",
    highlight: "bg-gradient-to-r from-yellow-400 to-pink-400",
    cardGradient: "from-purple-500 to-pink-500",
    featureGradient: "from-blue-500 to-teal-400",
    textPrimary: "text-purple-500",
    textSecondary: "text-pink-500",
    textAccent: "text-blue-500",
    borderAccent: "border-purple-500",
    bgSubtle: "bg-purple-50",
  }
};