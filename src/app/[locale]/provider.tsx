"use client";

import { ConfigProvider, theme } from "antd";
import { ThemeProvider } from "next-themes";
import { useThemeStore } from "../_store/clientStore";
import { InitializeUser } from "../_components/InitializeUser";

export default function Provider({ children }: { children: React.ReactNode }) {
	const { theme: themeStore } = useThemeStore();

	return (
		<ConfigProvider
			theme={{
				algorithm:
					themeStore === "dark" ? theme.darkAlgorithm : theme.compactAlgorithm,
			}}
		>
			<ThemeProvider
				attribute="class"
				defaultTheme="system"
				enableSystem
				forcedTheme={themeStore}
			>
				<InitializeUser />
				{children}
			</ThemeProvider>
		</ConfigProvider>
	);
}
