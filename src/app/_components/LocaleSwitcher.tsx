"use client";

import { useLocale } from "next-intl";
import type { ChangeEventHandler } from "react";

import { usePathname, useRouter } from "@/lib/i18nNavigation";
import { AppConfig, type AppLocale } from "@/utils/appConfig";

export default function LocaleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const handleChange: ChangeEventHandler<HTMLSelectElement> = (event) => {
    router.push(pathname, { locale: event.target.value as AppLocale });
    router.refresh();
  };

  return (
    <select
      defaultValue={locale}
      onChange={handleChange}
      className="border border-gray-300 font-medium focus:outline-none focus-visible:ring"
    >
      {AppConfig.locales.map((localeKey) => (
        <option key={localeKey} value={localeKey}>
          {AppConfig.localeLabels[localeKey]}
        </option>
      ))}
    </select>
  );
}
