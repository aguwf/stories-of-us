import "mapbox-gl/dist/mapbox-gl.css";
import "@/styles/globals.css";

import { Toaster } from "@/components/ui/sonner";
import { TRPCReactProvider } from "@/trpc/react";
import { isSupportedLocale, type AppLocale } from "@/utils/appConfig";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { NextIntlClientProvider, useMessages } from "next-intl";
import { Poppins } from "next/font/google";
import { notFound } from "next/navigation";
import Provider from "./provider";
import { ClerkProvider } from "@clerk/nextjs";
import { enUS, frFR, viVN } from "@clerk/localizations";
import type { LocalizationResource } from "@clerk/types";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "Stories of Us",
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

const poppinsFont = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

const clerkLocalizations: Record<AppLocale, LocalizationResource> = {
  en: enUS,
  fr: frFR,
  vi: viVN,
};

export default function RootLayout(props: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Validate that the incoming `locale` parameter is supported
  if (!isSupportedLocale(props.params.locale)) notFound();

  const locale = props.params.locale;
  const clerkLocale = clerkLocalizations[locale] ?? enUS;
  const localizePath = (path: string) => `/${locale}${path}`;

  // Using internationalization in Client Components
  const messages = useMessages();

  return (
    <ClerkProvider
      localization={clerkLocale}
      signInUrl={localizePath("/sign-in")}
      signUpUrl={localizePath("/sign-up")}
      signInFallbackRedirectUrl={localizePath("/dashboard")}
      signUpFallbackRedirectUrl={localizePath("/dashboard")}
    >
      <html lang={locale} suppressHydrationWarning={true}>
        <body
          className={`min-h-screen bg-background antialiased ${poppinsFont.className}`}
        >
          <TRPCReactProvider>
            <NextIntlClientProvider locale={locale} messages={messages}>
              <Provider>
                {props.children}
                <Toaster />
                <Analytics />
              </Provider>
            </NextIntlClientProvider>
          </TRPCReactProvider>
          <SpeedInsights />
        </body>
      </html>
    </ClerkProvider>
  );
}

// Enable edge runtime but you are required to disable the `migrate` function in `src/libs/DB.ts`
// Unfortunately, this also means it will also disable the automatic migration of the database
// And, you will have to manually migrate it with `drizzle-kit push`
// export const runtime = 'edge';
