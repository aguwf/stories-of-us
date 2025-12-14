import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["var(--font-poppins)", ...fontFamily.sans],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        primary: {
          DEFAULT: "var(--primary)",
          light: "var(--primary-light)",
          foreground: "var(--primary-foreground)",
        },
        background: {
          DEFAULT: "var(--background)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          light: "var(--secondary-light)",
          foreground: "var(--secondary-foreground)",
        },
        "doc-vet": "var(--doc-vet)",
        "doc-vaccine": "var(--doc-vaccine)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        border: "var(--border)",
        shadow: "var(--shadow)",
        highlight: "var(--highlight)", // Kept if used, otherwise candidate for removal
        success: "var(--success)",
        warning: "var(--warning)",
        danger: "var(--danger)",
        // brandPurple & pastel removed as requested
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        input: "var(--input)",
        ring: "var(--ring)",
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
      },
    },
  },
  darkMode: ["selector"],
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
