/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1B4332", // Deep Forest Green
        accent: "#D4A017", // Gold
        background: "#F9FAFB", // Clean off-white
        surface: "#FFFFFF", // White
        text: {
          primary: "#111827", // Near-black
        },
        success: "#16A34A",
        error: "#DC2626",
        border: "#E5E7EB",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        serif: ["var(--font-playfair)", "serif"],
      },
      borderRadius: {
        "2xl": "16px",
      },
      maxWidth: {
        "1280": "1280px",
      },
    },
  },
  plugins: [],
};
