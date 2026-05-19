/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        bg: "#FAFAF7",
        surface: "#FFFFFF",
        text: "#111111",
        muted: "#6B7280",
        border: "#E5E7EB",
        primary: {
          50:  "#E8F0EA",
          100: "#C5D7CA",
          200: "#9CBBA5",
          300: "#72A081",
          400: "#4F8A65",
          500: "#2E764A",
          600: "#1F5A38",
          700: "#145224",
          800: "#0F3E1B",
          900: "#0A2A12",
        },
        cream: "#EFEDE7",
      },
      fontFamily: {
        sans: ["Onest", "Inter", "system-ui"],
      },
    },
  },
  plugins: [],
};
