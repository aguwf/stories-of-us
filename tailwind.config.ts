import { nextui } from "@nextui-org/react";
import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
	content: [
		"./src/**/*.tsx",
		"./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		extend: {
			fontFamily: {
				sans: ["var(--font-geist-sans)", ...fontFamily.sans],
			},
		},
	},
	darkMode: "class",
	plugins: [
		nextui({
			themes: {
				dark: {
					extend: "dark",
					colors: {
						background: "#212529",
						foreground: "#f0f0f0",
						primary: "#4d9cb6",
						secondary: "#ad97ad",
						success: "#5cb65c",
						warning: "#d8d863",
						danger: "#cd6d6d",
					},
				},
				light: {
					extend: "light",
					colors: {
						background: "#f0f0f0",
						foreground: "#212529",
						primary: "#6bc7e6",
						secondary: "#D8BFD8",
						success: "#7af07a",
						warning: "#e8e87d",
						danger: "#f08080",
					},
				},
			},
		}),
	],
} satisfies Config;
