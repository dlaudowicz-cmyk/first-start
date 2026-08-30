import type { Config } from "tailwindcss";

/** Farben, die auf den CSS-Variablen aus globals.css liegen. Dadurch bleibt
 *  die Definition an einer Stelle und Utility-Klassen wie `text-ink-mute`
 *  ziehen automatisch mit. */
const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ground: token("ground"),
        surface: {
          DEFAULT: token("surface"),
          2: token("surface-2"),
          3: token("surface-3"),
        },
        line: {
          DEFAULT: token("line"),
          soft: token("line-soft"),
        },
        ink: {
          DEFAULT: token("ink"),
          mute: token("ink-mute"),
          faint: token("ink-faint"),
        },
        neon: {
          DEFAULT: token("accent"),
          ink: token("accent-ink"),
          50: "#f7ffd9",
          100: "#ecffa6",
          200: "#deff66",
          300: "#caff3d",
          400: "#b0f000",
          500: "#94cc00",
          600: "#75a300",
          700: "#587a00",
          800: "#3f5700",
          900: "#283600",
        },
        danger: token("danger"),
        warn: token("warn"),
        ok: token("ok"),

        // Graphit bleibt für die Sidebar und Restflächen erhalten.
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
      },
      fontFamily: {
        // Archivo ist eine geometrische Grotesk und liegt damit deutlich näher
        // an der Wortmarke als die vorherige Serife.
        sans: ["var(--font-archivo)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-archivo)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-plex-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      letterSpacing: {
        wordmark: "0.14em",
      },
    },
  },
  plugins: [],
};

export default config;
