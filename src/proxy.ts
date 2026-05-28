import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Reserved subdomains — these must never be treated as storefronts.
// Keeping this list inline (duplicated from reservedKeywords.ts) because
// middleware runs in the Edge runtime and cannot import from src/utils.
const RESERVED_SUBDOMAINS = new Set([
  'admin', 'administrator', 'adm', 'root', 'sys', 'system', 'manager',
  'dashboard', 'portal', 'control', 'panel', 'cpanel', 'whm',
  'aloaye', 'main', 'master', 'platform', 'domain', 'subdomain',
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

export function proxy(request: NextRequest) {
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

  // If the detected subdomain is a reserved platform word (admin, login, dashboard …)
  // do NOT treat it as a storefront — let the request fall through to the real page.
  if (subdomain && RESERVED_SUBDOMAINS.has(subdomain)) {
    subdomain = '';
  }

  // Identify platform domains & local hosts to distinguish custom domains
  const isMainDomain = cleanHost === 'aloaye.tech' || cleanHost === 'www.aloaye.tech' || cleanHost === 'aloaye.com' || cleanHost === 'www.aloaye.com';
  const isLocalMain = cleanHost === 'localhost' || cleanHost === 'lvh.me' || cleanHost === 'www.localhost' || cleanHost === 'www.lvh.me';

  // Any *.localhost or *.lvh.me host is a loopback host — never a custom domain.
  const isLoopbackHost = isLocal;

  const isCustomDomain = !isMainDomain && !isLocalMain && !isLoopbackHost && !subdomain && parts.length >= 2;


  // Redirect dashboard, admin, login, and signup routes on subdomains back to the main domain
  const { pathname } = url;
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

  // Do NOT rewrite Next.js assets, system paths, standard global pages, or API requests
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

// ── Matcher ────────────────────────────────────────────────────────────────
// Only run middleware on application pages — skip internal Next.js routes,
// static files, and the public directory so that crawlers & assets aren't slowed.
export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     *  - _next/static  (static files)
     *  - _next/image   (image optimisation)
     *  - favicon.ico
     *  - public root files (robots.txt, sitemap.xml, llm.txt, manifest.json, etc.)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap.*\\.xml|llm\\.txt|manifest\\.json|.*\\.(?:png|jpg|jpeg|gif|webp|avif|svg|ico|woff|woff2|ttf|otf|css|js)).*)',
  ],
};

