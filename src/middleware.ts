import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';

  // Remove port from host if present
  const cleanHost = hostname.split(':')[0];
  const parts = cleanHost.split('.');

  let subdomain = '';

  // Check if running on localhost or loopback domain
  const isLocal = cleanHost.endsWith('localhost') || cleanHost.endsWith('lvh.me');

  if (isLocal) {
    // e.g. storename.localhost or storename.lvh.me
    if (parts.length > 1 && parts[0] !== 'www' && parts[0] !== 'localhost' && parts[0] !== 'lvh') {
      subdomain = parts[0];
    }
  } else {
    // e.g. storename.aloaye.tld or storename.aloaye.com
    if (parts.length >= 3 && parts[0] !== 'www') {
      subdomain = parts[0];
    }
  }

  // Identify platform domains & local hosts to distinguish custom domains
  const isMainDomain = cleanHost === 'aloaye.tech' || cleanHost === 'www.aloaye.tech' || cleanHost === 'aloaye.com' || cleanHost === 'www.aloaye.com';
  const isLocalMain = cleanHost === 'localhost' || cleanHost === 'lvh.me' || cleanHost === 'www.localhost' || cleanHost === 'www.lvh.me';

  const isCustomDomain = !isMainDomain && !isLocalMain && !subdomain && parts.length >= 2;

  // Do NOT rewrite Next.js assets, system paths, standard global pages, or API requests
  const { pathname } = url;
  const isSystemPath = 
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/globals.css') ||
    pathname === '/signup' ||
    pathname.startsWith('/track') ||
    /\.(png|jpg|jpeg|gif|svg|ico|css|js|json|txt|xml|woff|woff2|ttf|otf)$/i.test(pathname);

  // If a valid subdomain is identified, rewrite requests internally
  if (subdomain && !isSystemPath) {
    url.pathname = `/${subdomain}${pathname}`;
    return NextResponse.rewrite(url);
  }

  // If a custom domain is identified, rewrite requests internally using the clean host as the identifier
  if (isCustomDomain && !isSystemPath) {
    url.pathname = `/${cleanHost}${pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}
