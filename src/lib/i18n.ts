import { getRequestConfig } from "next-intl/server";

import { AppConfig, isSupportedLocale } from "@/utils/appConfig";

// Using internationalization in Server Components
export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !isSupportedLocale(locale)) {
    locale = AppConfig.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../locales/${locale}.json`)).default,
  };
});
