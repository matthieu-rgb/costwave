import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { auth } from './lib/auth';
import { NextRequest, NextResponse } from 'next/server';

const i18nMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  // i18n middleware first (handles locale routing)
  const response = i18nMiddleware(request);

  // Auth protection for (app)/* routes
  const pathname = request.nextUrl.pathname;

  // Extract locale from pathname (e.g., /en/app/dashboard → locale=en, path=/app/dashboard)
  const localeMatch = pathname.match(/^\/(fr|en|de)(\/.*)?$/);
  const pathWithoutLocale = localeMatch ? localeMatch[2] || '/' : pathname;

  // Protect all /{locale}/app/* routes
  if (pathWithoutLocale.startsWith('/app')) {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      const locale = localeMatch?.[1] || routing.defaultLocale;
      const loginUrl = new URL(`/${locale}/login`, request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
