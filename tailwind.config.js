const colors = require("tailwindcss/colors");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      animation: {
        "spin-fast": "spin 0.5s linear infinite",
      },
      colors: {
        base: colors.zinc,
        primary: colors.sky,
        info: colors.blue,
        success: colors.green,
        warn: colors.orange,
        error: colors.red,
      },
    },
  },
  plugins: [],
};
