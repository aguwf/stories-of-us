import { AppConfig } from "./appConfig";

export const getBaseUrl = () => {
	if (process.env.NEXT_PUBLIC_APP_URL) {
		return process.env.NEXT_PUBLIC_APP_URL;
	}

	if (typeof window !== "undefined") {
		return window.location.origin;
	}

	if (process.env.VERCEL_URL) {
		return `https://${process.env.VERCEL_URL}`;
	}

	return `http://localhost:${process.env.PORT ?? 3000}`;
};

export const getI18nPath = (url: string, locale: string) => {
	const shouldPrefix =
		AppConfig.localePrefix === "always" ||
		(AppConfig.localePrefix === "as-needed" &&
			locale !== AppConfig.defaultLocale);

	return shouldPrefix ? `/${locale}${url}` : url;
};
