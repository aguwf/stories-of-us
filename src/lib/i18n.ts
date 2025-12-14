import { getRequestConfig } from "next-intl/server";

import { AppConfig, isSupportedLocale } from "@/utils/appConfig";

// Using internationalization in Server Components
export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !AppConfig.locales.includes(locale as any)) {
    locale = AppConfig.defaultLocale;
  }

  const resolvedLocale = isSupportedLocale(locale)
    ? locale
    : AppConfig.defaultLocale;

  return {
    locale: resolvedLocale,
    messages: (await import(`../locales/${resolvedLocale}.json`)).default,
  };
});
