"use client";

import { StyleProvider } from "@ant-design/cssinjs";
import { ConfigProvider, theme } from "antd";
import { ThemeProvider } from "next-themes";
import { useThemeStore } from "../_store/clientStore";

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
				<StyleProvider layer>{children}</StyleProvider>
			</ThemeProvider>
		</ConfigProvider>
	);
}
