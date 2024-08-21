import "@/styles/globals.css";

import { TRPCReactProvider } from "@/trpc/react";
import { AppConfig } from "@/utils/AppConfig";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { NextUIProvider } from "@nextui-org/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import { NextIntlClientProvider, useMessages } from "next-intl";
import { ThemeProvider } from "next-themes";
import { notFound } from "next/navigation";
import { useClientStore } from "../_store/clientStore";
import Provider from "./provider";

export const metadata: Metadata = {
	title: "Stories of us",
	description: "Create by AGuwf",
	icons: [
		{
			rel: "apple-touch-icon",
			url: "/apple-touch-icon.png",
		},
		{
			rel: "icon",
			type: "image/png",
			sizes: "32x32",
			url: "/favicon-32x32.png",
		},
		{
			rel: "icon",
			type: "image/png",
			sizes: "16x16",
			url: "/favicon-16x16.png",
		},
		{
			rel: "icon",
			url: "/favicon.ico",
		},
	],
	manifest: "/manifest.json",
};

export default function RootLayout(props: {
	children: React.ReactNode;
	params: { locale: string };
}) {
	// Validate that the incoming `locale` parameter is valid
	if (!AppConfig.locales.includes(props.params.locale)) notFound();

	// Using internationalization in Client Components
	const messages = useMessages();

	return (
		<html lang={props.params.locale} suppressHydrationWarning>
			<body
				className={`min-h-screen bg-background antialiased ${GeistSans.className}`}
			>
				<TRPCReactProvider>
					<NextIntlClientProvider
						locale={props.params.locale}
						messages={messages}
					>
						<AntdRegistry>
							<Provider>
								<NextUIProvider>{props.children}</NextUIProvider>
							</Provider>
						</AntdRegistry>
					</NextIntlClientProvider>
				</TRPCReactProvider>
				<SpeedInsights />
			</body>
		</html>
	);
}

// Enable edge runtime but you are required to disable the `migrate` function in `src/libs/DB.ts`
// Unfortunately, this also means it will also disable the automatic migration of the database
// And, you will have to manually migrate it with `drizzle-kit push`
// export const runtime = 'edge';
