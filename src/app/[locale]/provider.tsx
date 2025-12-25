"use client";

import { ThemeProvider } from "next-themes";
import { useThemeStore } from "../_store/clientStore";
import React from "react";

export default function Provider({ children }: { children: React.ReactNode }) {
	const { theme: themeStore } = useThemeStore();
	const [mounted, setMounted] = React.useState(false);

	React.useEffect(() => {
		setMounted(true);
	}, []);

	return (
		<ThemeProvider
			attribute="class"
			defaultTheme="system"
			enableSystem={true}
			forcedTheme={mounted ? (themeStore || undefined) : undefined}
		>
			{children}
		</ThemeProvider>
	);
}
