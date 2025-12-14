import "mapbox-gl/dist/mapbox-gl.css";
import "@/styles/globals.css";

import { Toaster } from "@/components/ui/sonner";
import { TRPCReactProvider } from "@/trpc/react";
import {
  AppConfig,
  isSupportedLocale,
  type AppLocale,
} from "@/utils/appConfig";
import { getBaseUrl, getI18nPath } from "@/utils/helpers";
import { defaultSiteDescription } from "@/utils/seo";
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

const baseUrl = getBaseUrl();

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  applicationName: AppConfig.name,
  title: {
    default: AppConfig.name,
    template: `%s | ${AppConfig.name}`,
  },
  description: defaultSiteDescription,
  keywords: ["stories of us", "timeline", "memories", "journal", "AGuwf"],
  authors: [{ name: "AGuwf", url: "https://aguwf.com" }],
  creator: "AGuwf",
  publisher: "AGuwf",
  alternates: {
    canonical: baseUrl,
    languages: {
      ...Object.fromEntries(
        AppConfig.locales.map((locale) => [
          locale,
          `${baseUrl}${getI18nPath("/", locale)}`,
        ])
      ),
      "x-default": `${baseUrl}${getI18nPath("/", AppConfig.defaultLocale)}`,
    },
  },
  openGraph: {
    title: AppConfig.name,
    description: defaultSiteDescription,
    url: baseUrl,
    siteName: AppConfig.name,
    locale: AppConfig.defaultLocale,
    type: "website",
    images: [
      {
        url: `${baseUrl}/pickme-logo.png`,
        width: 1200,
        height: 630,
        alt: `${AppConfig.name} cover`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: AppConfig.name,
    description: defaultSiteDescription,
    images: [`${baseUrl}/pickme-logo.png`],
    creator: "@aguwf",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: [
    {
      rel: "apple-touch-icon",
      url: "/pickme-logo.png",
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
    <html
      lang={locale}
      suppressHydrationWarning={true}
      className={poppinsFont.className}
    >
      <body className={`min-h-screen bg-background antialiased`}>
        <ClerkProvider
          localization={clerkLocale as any}
          signInUrl={localizePath("/sign-in")}
          signUpUrl={localizePath("/sign-up")}
          signInFallbackRedirectUrl={localizePath("/dashboard")}
          signUpFallbackRedirectUrl={localizePath("/dashboard")}
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
        </ClerkProvider>
      </body>
    </html>
  );
}

// Enable edge runtime but you are required to disable the `migrate` function in `src/libs/DB.ts`
// Unfortunately, this also means it will also disable the automatic migration of the database
// And, you will have to manually migrate it with `drizzle-kit push`
// export const runtime = 'edge';
