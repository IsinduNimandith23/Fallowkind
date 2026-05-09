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
        display: ["var(--font-display)", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
