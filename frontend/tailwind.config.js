/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#06080f",
        ink: { DEFAULT: "#e9edf6", muted: "#8b93a7", faint: "#5b6577" },
        accent: { DEFAULT: "#6366f1", soft: "#818cf8" },
        pos: "#34d399",
        neg: "#f87171",
        warn: "#fbbf24",
        line: "rgba(255,255,255,0.08)",
        "line-strong": "rgba(255,255,255,0.14)",
        surface: "rgba(255,255,255,0.025)",
        "surface-2": "rgba(255,255,255,0.045)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        glass: "0 1px 0 rgba(255,255,255,0.05) inset, 0 24px 60px -30px rgba(0,0,0,0.9)",
        glow: "0 0 0 1px rgba(99,102,241,0.35), 0 8px 40px -8px rgba(99,102,241,0.45)",
      },
      letterSpacing: { tightest: "-0.04em" },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: { "100%": { transform: "translateX(100%)" } },
        ring: {
          "0%": { boxShadow: "0 0 0 0 rgba(52,211,153,0.5)" },
          "70%": { boxShadow: "0 0 0 7px rgba(52,211,153,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(52,211,153,0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.55s cubic-bezier(0.22,1,0.36,1) both",
        ring: "ring 2.4s infinite",
      },
    },
  },
  plugins: [],
};
