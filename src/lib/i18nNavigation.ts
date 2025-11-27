import { createNavigation  } from "next-intl/navigation";

import { AppConfig } from "@/utils/appConfig";

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation({
	locales: AppConfig.locales,
	localePrefix: AppConfig.localePrefix,
});
