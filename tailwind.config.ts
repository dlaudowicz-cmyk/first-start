import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        graphite: {
          50: "#f7f7f8",
          100: "#eeeef0",
          200: "#d8d8dd",
          300: "#b4b4bc",
          400: "#888893",
          500: "#5e5e6b",
          600: "#454552",
          700: "#34343f",
          800: "#1f1f27",
          900: "#14141a",
          950: "#0b0b10",
        },
        sand: {
          50: "#fbf7f0",
          100: "#f4ecdb",
          200: "#e8d6ad",
          300: "#dcbe7e",
          400: "#cfa553",
          500: "#bf8c34",
          600: "#a07327",
          700: "#7e5a23",
          800: "#5e4320",
          900: "#3f2d17",
        },
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        display: ["ui-serif", "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 1px 2px 0 rgba(11, 11, 16, 0.05), 0 1px 3px 0 rgba(11, 11, 16, 0.07)",
        soft: "0 4px 16px -4px rgba(11, 11, 16, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
