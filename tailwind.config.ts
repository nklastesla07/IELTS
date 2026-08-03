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
        darkBg: "#121212",
        cardBg: "#18181b",
        cardBorder: "#27272a",
        accentLight: "#00c6ff",
        accentDark: "#0072ff",
        textMain: "#e4e4e7",
        textHeading: "#ffffff",
        dangerRed: "#f87171",
        successGreen: "#4ade80",
      },
      backgroundImage: {
        "gradient-accent": "linear-gradient(to right, #00c6ff, #0072ff)",
        "gradient-accent-hover": "linear-gradient(to right, #00b4e6, #0066e6)",
      },
      fontFamily: {
        sans: ["var(--font-montserrat)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
