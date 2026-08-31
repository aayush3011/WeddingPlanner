import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        linen: "#f7efe7",
        blush: "#e8b4b8",
        ink: "#2d2327",
        sage: "#8a9a7b",
      },
    },
  },
  plugins: [],
};

export default config;
