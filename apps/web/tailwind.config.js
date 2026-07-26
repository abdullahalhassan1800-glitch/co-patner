/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#ff0069",
          light: "#ff3385",
          dark: "#cc0054",
          50: "#FFF0F5",
          100: "#FFE0EB",
          200: "#FFC2D6",
          300: "#FF99BB",
          400: "#FF6699",
          500: "#ff0069",
          600: "#cc0054",
          700: "#990040",
          800: "#66002B",
          900: "#330015",
        },
        secondary: {
          DEFAULT: "#06B6D4",
          light: "#22D3EE",
          dark: "#0891B2",
        },
        accent: {
          DEFAULT: "#F43F5E",
          light: "#FB7185",
          dark: "#E11D48",
        },
        surface: {
          DEFAULT: "#0F0F19",
          light: "#16162A",
          dark: "#0A0A14",
        },
        pink: {
          DEFAULT: "#ff0069",
          light: "#ff3385",
          dark: "#cc0054",
          glow: "rgba(255,0,105,0.4)",
          glass: "rgba(255,0,105,0.08)",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        heading: ["Montserrat", "system-ui", "sans-serif"],
        body: ["Space Grotesk", "Inter", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      animation: {
        "live-pulse": "livePulse 2s ease-in-out infinite",
        "float-slow": "floatSlow 6s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "slide-up-fast": "slideUpFast 0.5s cubic-bezier(0.16,1,0.3,1) forwards",
      },
      keyframes: {
        livePulse: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.5", transform: "scale(1.2)" },
        },
        floatSlow: {
          "0%, 100%": { transform: "translateY(0) scale(1)" },
          "50%": { transform: "translateY(-12px) scale(1.03)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        slideUpFast: {
          from: { opacity: "0", transform: "translateY(30px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
