import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';
import { betterFetch } from '@better-fetch/fetch';
import type { Session } from 'better-auth/types';

const i18nMiddleware = createMiddleware(routing);

export default async function proxy(request: NextRequest) {
  // Trust proxy headers to prevent port leaking in redirects
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto');

  if (forwardedHost && forwardedProto) {
    request.nextUrl.protocol = forwardedProto.includes('https') ? 'https:' : 'http:';
    request.nextUrl.host = forwardedHost;
    request.nextUrl.port = '';
  }

  // i18n routing first (handles locale routing)
  const response = i18nMiddleware(request);

  // Auth protection for (app)/* routes
  const pathname = request.nextUrl.pathname;

  // Extract locale from pathname (e.g., /en/app/dashboard → locale=en, path=/app/dashboard)
  const localeMatch = pathname.match(/^\/(fr|en|de)(\/.*)?$/);
  const pathWithoutLocale = localeMatch ? localeMatch[2] || '/' : pathname;

  // Protect all /{locale}/app/* routes
  if (pathWithoutLocale.startsWith('/app')) {
    const { data: session } = await betterFetch<Session>('/api/auth/get-session', {
      baseURL: request.nextUrl.origin,
      headers: {
        cookie: request.headers.get('cookie') || '',
      },
    });

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
