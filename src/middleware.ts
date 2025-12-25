import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";

import { AppConfig, isSupportedLocale } from "./utils/appConfig";

const intlMiddleware = createMiddleware({
  locales: AppConfig.locales,
  localePrefix: AppConfig.localePrefix,
  defaultLocale: AppConfig.defaultLocale,
});

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/:locale/dashboard(.*)",
]);

export default function middleware(
  request: NextRequest,
  event: NextFetchEvent
) {
  const { pathname, search } = request.nextUrl;

  const segments = pathname.split("/").filter(Boolean);
  const potentialLocale = segments[0];
  const hasLocalePrefix = isSupportedLocale(potentialLocale ?? "");
  const pathWithoutLocale = hasLocalePrefix
    ? `/${segments.slice(1).join("/")}`
    : pathname;

  // Check if this is an API or TRPC route first (before any locale redirects)
  const isApiRoute = pathWithoutLocale.startsWith("/api");
  const isTrpcRoute =
    pathWithoutLocale.startsWith("/trpc") ||
    pathWithoutLocale.startsWith("/api/trpc");

  if (isApiRoute || isTrpcRoute) {
    // Apply Clerk auth for API/TRPC requests but skip locale handling
    return clerkMiddleware()(request, event);
  }

  const redirectLocale = hasLocalePrefix
    ? potentialLocale
    : AppConfig.defaultLocale;

  if (!isApiRoute && !hasLocalePrefix) {
    const destination =
      pathname === "/"
        ? `/${redirectLocale}/timelines`
        : `/${redirectLocale}${pathname}`;
    const url = new URL(request.url);
    url.pathname = destination;
    url.search = search;

    return NextResponse.redirect(url);
  }

  if (!isApiRoute && hasLocalePrefix && segments.length === 1) {
    const url = new URL(request.url);
    url.pathname = `/${redirectLocale}/timelines`;
    url.search = search;

    return NextResponse.redirect(url);
  }

  return clerkMiddleware(async (auth, req: NextRequest) => {
    if (isProtectedRoute(req)) {
      const { userId, redirectToSignIn } = await auth();
      if (!userId) {
        return redirectToSignIn({ returnBackUrl: req.url });
      }
    }

    return intlMiddleware(req);
  })(request, event);
}

export const config = {
  matcher: ["/((?!_next|_vercel|.*\\..*).*)", "/(api|trpc)(.*)"],
};
