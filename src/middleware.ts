import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Reserved subdomains — these must never be treated as storefronts.
const RESERVED_SUBDOMAINS = new Set([
  'admin', 'administrator', 'adm', 'root', 'sys', 'system', 'manager',
  'dashboard', 'portal', 'control', 'panel', 'cpanel', 'whm',
  'frontstore', 'main', 'master', 'platform', 'domain', 'subdomain',
  'site', 'website', 'web', 'home', 'index', 'track',
  'auth', 'login', 'signin', 'signup', 'register', 'logout', 'signout',
  'session', 'sessions', 'oauth', 'sso', 'account', 'accounts',
  'profile', 'user', 'users', 'member', 'members',
  'client', 'clients', 'customer', 'customers',
  'www', 'www1', 'www2', 'www3', 'localhost', 'lvh',
  'dns', 'ns', 'ns1', 'ns2', 'ns3', 'ns4', 'ftp',
  'smtp', 'pop', 'imap', 'git', 'github', 'gitlab',
  'dev', 'development', 'staging', 'test', 'testing',
  'prod', 'production', 'demo', 'sandbox', 'beta', 'alpha',
  'api', 'apis', 'v1', 'v2', 'v3', 'graphql', 'rest',
  'ws', 'websocket', 'webhook', 'webhooks',
  'cdn', 'static', 'assets', 'media', 'images', 'img', 'uploads', 'upload',
  'billing', 'pay', 'payment', 'payments', 'checkout', 'cart',
  'subscribe', 'subscription', 'pro', 'premium', 'store', 'shop', 'sales',
  'support', 'help', 'helpdesk', 'contact', 'about', 'info',
  'faq', 'faqs', 'docs', 'documentation', 'guide', 'guides',
  'status', 'health', 'monitor', 'feedback', 'chat',
  'mail', 'email', 'newsletter', 'blog', 'news', 'press',
  'legal', 'terms', 'privacy', 'policy', 'tos',
  'security', 'abuse', 'compliance', 'copyright',
]);

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';

  // Remove port from host if present
  const cleanHost = hostname.split(':')[0];
  const parts = cleanHost.split('.');
  const { pathname, search } = url;

  // Do NOT rewrite Next.js assets, system paths, standard global pages, or API requests
  const isSystemPath =
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/globals.css') ||
    pathname === '/signup' ||
    pathname.startsWith('/track') ||
    /\.(png|jpg|jpeg|gif|svg|ico|css|js|json|txt|xml|woff|woff2|ttf|otf)$/i.test(pathname);

  // 1. Enforce canonical domain (redirect www.frontstore.ng, frontstore.app, www.frontstore.app to frontstore.ng)
  if (!isSystemPath && (cleanHost === 'www.frontstore.ng' || cleanHost === 'frontstore.app' || cleanHost === 'www.frontstore.app')) {
    return NextResponse.redirect(`https://frontstore.ng${pathname}${search}`, 301);
  }

  let subdomain = '';

  // Check if running on localhost or loopback domain
  const isLocal = cleanHost.endsWith('localhost') || cleanHost.endsWith('lvh.me');

  if (isLocal) {
    if (parts.length > 1 && parts[0] !== 'www' && parts[0] !== 'localhost' && parts[0] !== 'lvh') {
      subdomain = parts[0];
    }
  } else {
    if (parts.length >= 3 && parts[0] !== 'www') {
      subdomain = parts[0];
    }
  }

  if (subdomain && RESERVED_SUBDOMAINS.has(subdomain)) {
    subdomain = '';
  }

  const isMainDomain =
    cleanHost === 'frontstore.ng' || cleanHost === 'www.frontstore.ng' ||
    cleanHost === 'frontstore.app' || cleanHost === 'www.frontstore.app';
  const isLocalMain = cleanHost === 'localhost' || cleanHost === 'lvh.me' || cleanHost === 'www.localhost' || cleanHost === 'www.lvh.me';
  const isLoopbackHost = isLocal;

  const isPlatformDomain =
    isMainDomain ||
    isLocalMain ||
    isLoopbackHost ||
    cleanHost.endsWith('.frontstore.ng') ||
    cleanHost.endsWith('.frontstore.app') ||
    cleanHost.endsWith('.localhost') ||
    cleanHost.endsWith('.lvh.me');

  const isCustomDomain = !isPlatformDomain && parts.length >= 2;

  // Redirect dashboard, admin, login, and signup routes on subdomains back to the main domain
  const isAuthOrDashboard =
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/dashboard' ||
    pathname === '/admin' ||
    pathname.startsWith('/dashboard/') ||
    pathname.startsWith('/admin/');

  if (subdomain && isAuthOrDashboard) {
    const mainUrl = request.nextUrl.clone();
    const hostHeader = request.headers.get('host') || '';
    mainUrl.host = hostHeader.replace(`${subdomain}.`, '');
    return NextResponse.redirect(mainUrl);
  }

  // Redirect legacy subdomain storefront links to canonical path URLs (e.g. frontstore.ng/ade)
  if (subdomain && isPlatformDomain && !isSystemPath) {
    const mainUrl = request.nextUrl.clone();
    const hostHeader = request.headers.get('host') || '';
    mainUrl.host = hostHeader.replace(`${subdomain}.`, '');
    mainUrl.pathname = `/${subdomain}${pathname}`;
    return NextResponse.redirect(mainUrl, 308);
  }

  // Rewrite custom domain requests internally
  if (isCustomDomain && !isSystemPath) {
    url.pathname = `/${cleanHost}${pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export { middleware as proxy };

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap.*\\.xml|llm\\.txt|manifest\\.json|.*\\.(?:png|jpg|jpeg|gif|webp|avif|svg|ico|woff|woff2|ttf|otf|css|js)).*)',
  ],
};
