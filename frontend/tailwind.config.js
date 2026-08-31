/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F4F6F1",
        ink: "#16241F",
        clinic: {
          DEFAULT: "#0F6B57",
          dark: "#0B4F41",
          light: "#E7EEE9",
        },
        marigold: "#E2A73E",
        brick: "#B3432F",
        line: "#D8DED8",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        sans: ["Public Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};