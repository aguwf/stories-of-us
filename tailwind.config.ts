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
				poppins: ["var(--font-poppins)", ...fontFamily.sans],
    		},
    		borderRadius: {
    			lg: 'var(--radius)',
    			md: 'calc(var(--radius) - 2px)',
    			sm: 'calc(var(--radius) - 4px)'
    		},
    		colors: {
    			background: 'var(--background)',
    			foreground: 'var(--foreground)',
    			card: {
    				DEFAULT: 'var(--card)',
    				foreground: 'var(--card-foreground)'
    			},
    			popover: {
    				DEFAULT: 'var(--popover)',
    				foreground: 'var(--popover-foreground)'
    			},
    			primary: {
    				DEFAULT: 'var(--primary)',
    				foreground: 'var(--primary-foreground)'
    			},
    			secondary: {
    				DEFAULT: 'var(--secondary)',
    				foreground: 'var(--secondary-foreground)'
    			},
    			accent: {
    				DEFAULT: 'var(--accent)',
    				hover: 'var(--accent-hover)'
    			},
    			text: 'var(--text)',
    			border: 'var(--border)',
    			shadow: 'var(--shadow)',
    			highlight: 'var(--highlight)',
    			success: 'var(--success)',
    			warning: 'var(--warning)',
    			danger: 'var(--danger)',
				purple: 'var(--purple)',
    			pastel: {
    				blue: 'var(--pastel-blue)',
    				green: 'var(--pastel-green)',
    				yellow: 'var(--pastel-yellow)',
    				purple: 'var(--pastel-purple)'
    			},
    			muted: {
    				DEFAULT: 'var(--muted)',
    				foreground: 'var(--muted-foreground)'
    			},
    			chart: {
    				'1': 'var(--chart-1)',
    				'2': 'var(--chart-2)',
    				'3': 'var(--chart-3)',
    				'4': 'var(--chart-4)',
    				'5': 'var(--chart-5)'
    			},
    			input: 'var(--input)',
    			ring: 'var(--ring)',
    			destructive: {
    				DEFAULT: 'var(--destructive)',
    				foreground: 'var(--destructive-foreground)'
    			},
    		}
    	}
    },
	darkMode: ["class"],
	plugins: [
		nextui({
			themes: {
				dark: {
					extend: "dark",
					colors: {
						background: "var(--background)",
						foreground: "var(--foreground)",
						primary: "var(--primary)",
						secondary: "var(--secondary)",
						success: "var(--success)",
						warning: "var(--warning)",
						danger: "var(--destructive)",
					},
				},
				light: {
					extend: "light",
					colors: {
						background: "var(--background)",
						foreground: "var(--foreground)",
						primary: "var(--primary)",
						secondary: "var(--secondary)",
						success: "var(--success)",
						warning: "var(--warning)",
						danger: "var(--destructive)",
					},
				},
			},
		}),
	],
} satisfies Config;
