/* eslint-disable */

// import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';

import { AppConfig } from './utils/AppConfig';

const intlMiddleware = createMiddleware({
  locales: AppConfig.locales,
  localePrefix: AppConfig.localePrefix,
  defaultLocale: AppConfig.defaultLocale,
});

// const isProtectedRoute = createRouteMatcher([
//   '/dashboard(.*)',
//   '/:locale/dashboard(.*)',
// ]);

export default function middleware(
  request: NextRequest,
) {
  // if (
  //   request.nextUrl.pathname.includes('/sign-in') ||
  //   request.nextUrl.pathname.includes('/sign-up') ||
  //   isProtectedRoute(request)
  // ) {
  //   return clerkMiddleware((auth: () => any, req: NextRequest) => {
  //     if (isProtectedRoute(req)) auth().protect();

  //     return intlMiddleware(req);
  //   })(request, event);
  // }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
