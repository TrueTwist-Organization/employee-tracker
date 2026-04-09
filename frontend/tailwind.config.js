/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#06b6d4", // cyan-500
          dark: "#0891b2",    // cyan-600
          light: "#22d3ee",   // cyan-400
        },
        secondary: {
          DEFAULT: "#f43f5e", // rose-500
          dark: "#e11d48",    // rose-600
          light: "#fb7185",   // rose-400
        },
        dark: {
          DEFAULT: "#020617",
          card: "#0f172a",
          border: "#1e293b",
        },
      },
    },
  },
  plugins: [],
}
