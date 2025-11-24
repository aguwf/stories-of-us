import type { LocalePrefixMode } from "next-intl/routing";

export const locales = ["en", "fr", "vi"] as const;
export type AppLocale = (typeof locales)[number];

const localePrefix: LocalePrefixMode = "as-needed";

export const localeLabels: Record<AppLocale, string> = {
	en: "English",
	fr: "Français",
	vi: "Tiếng Việt",
};

export const AppConfig = {
	name: "Stories Of Us",
	locales,
	defaultLocale: "en" as AppLocale,
	localePrefix,
	localeLabels,
};

export const isSupportedLocale = (locale: string): locale is AppLocale =>
	locales.includes(locale as AppLocale);
