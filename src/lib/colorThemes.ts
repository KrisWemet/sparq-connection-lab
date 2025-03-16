
// Define available color themes for the application
export const colorThemes = {
  azure: {
    name: "Azure Blue",
    primary: "#007bff",
    secondary: "#6c757d",
    accent: "#83c5be",
    gradient: "linear-gradient(90deg, #accbee 0%, #e7f0fd 100%)",
    lightBg: "#D3E4FD",
  },
  rose: {
    name: "Rose Pink",
    primary: "#e83e8c",
    secondary: "#6c757d",
    accent: "#f8c8dc",
    gradient: "linear-gradient(90deg, #ffafbd 0%, #ffc3a0 100%)",
    lightBg: "#FFF0F5",
  },
  indigo: {
    name: "Indigo Purple",
    primary: "#6610f2",
    secondary: "#6c757d",
    accent: "#d8bfd8",
    gradient: "linear-gradient(90deg, #9B87F5 0%, #E5DEFF 100%)",
    lightBg: "#E5DEFF",
  },
  rainbow: {
    name: "Rainbow",
    primary: "linear-gradient(90deg, #ff9a9e 0%, #fad0c4 100%)",
    secondary: "#6c757d",
    accent: "#ffecd2",
    gradient: "linear-gradient(90deg, #f6d365 0%, #fda085 100%)",
    lightBg: "#FFF9E6",
  },
  emerald: {
    name: "Emerald Green",
    primary: "#10b981",
    secondary: "#6c757d",
    accent: "#F2FCE2",
    gradient: "linear-gradient(90deg, #D4FC79 0%, #96E6A1 100%)",
    lightBg: "#F2FCE2",
  },
  coral: {
    name: "Coral Sunrise",
    primary: "#FF6B6B",
    secondary: "#4ECDC4",
    accent: "#FFE2E0",
    gradient: "linear-gradient(90deg, #FF9A9E 0%, #FECFEF 100%)",
    lightBg: "#FFE2E0",
  }
};

// Define emotions and relationship states with corresponding colors
export const emotionColors = {
  joy: "#FFD700", // Gold
  love: "#FF6B6B", // Coral red
  calm: "#4ECDC4", // Turquoise
  growth: "#77DD77", // Pastel green
  trust: "#83C5BE", // Teal
  intimacy: "#9B87F5", // Purple
  passion: "#FF5E78", // Bright pink
  connection: "#5E60CE", // Deep purple
}

// Animated gradients for special elements
export const animatedGradients = {
  celebration: "animate-gradient-xy bg-gradient-to-r from-yellow-300 via-pink-500 to-purple-500",
  achievement: "animate-gradient-xy bg-gradient-to-r from-green-300 via-blue-400 to-purple-400",
  progress: "animate-gradient-x bg-gradient-to-r from-blue-300 to-purple-400",
  special: "animate-gradient-xy bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-400",
}
