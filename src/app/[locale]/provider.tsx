"use client";

import { ThemeProvider } from "next-themes";
import { useThemeStore } from "../_store/clientStore";

export default function Provider({ children }: { children: React.ReactNode }) {
	const { theme: themeStore } = useThemeStore();

	return (
		<ThemeProvider
			attribute="class"
			defaultTheme="system"
			enableSystem={true}
			forcedTheme={themeStore}
		>
			{children}
		</ThemeProvider>
	);
}
