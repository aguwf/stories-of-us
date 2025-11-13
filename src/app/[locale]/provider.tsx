"use client";

import { ThemeProvider } from "next-themes";
import { InitializeUser } from "../_components/InitializeUser";
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
			<InitializeUser />
			{children}
		</ThemeProvider>
	);
}
