import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        forest:  "#2A3D2A",  // deep dark green (darkest swatch)
        sage:    "#4F6B4A",  // medium green
        moss:    "#7A9070",  // light olive/sage
        fern:    "#A8B89A",  // pale sage
        cream:   "#EDE6D3",  // warm cream (card backgrounds)
        linen:   "#F5F0E5",  // near-white (page background)
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Impact", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      keyframes: {
        fadeInUp: {
          "0%":   { opacity: "0", transform: "translateY(28px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideInLeft: {
          "0%":   { opacity: "0", transform: "translateX(-24px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        marquee: {
          "0%":   { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        scrollDown: {
          "0%":   { opacity: "0", transform: "translateY(-100%)" },
          "30%":  { opacity: "1" },
          "70%":  { opacity: "1" },
          "100%": { opacity: "0", transform: "translateY(150%)" },
        },
      },
      animation: {
        "fade-in-up":   "fadeInUp 0.7s ease-out forwards",
        "fade-in":      "fadeIn 0.6s ease-out forwards",
        "slide-in-left":"slideInLeft 0.6s ease-out forwards",
        "marquee":      "marquee 20s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
