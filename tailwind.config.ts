import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ivory: "#F8F6F2",
        linen: "#F1EEE8",
        line: "#E6E1D9",
        blush: "#C89C8E",
        "blush-light": "#F3E7E2",
        ink: "#252622",
        mist: "#77776F",
        sage: "#788970",
        "sage-dark": "#5F7258",
        "sage-light": "#E8EDE5",
        gold: "#B79B68",
      },
      fontFamily: {
        display: ["Georgia", "Cormorant Garamond", "serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
