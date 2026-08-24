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
  'access-refused', 'activate', 'affiliate', 'business', 'buyer', 'confirm',
  'marketplace', 'merchant', 'pricing', 'ref', 'refund-policy', 'return-policy',
  'returns', 'solutions', 'stores', 'tools', 'vs'
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

  // Rewrite subdomain storefront requests internally (e.g. debugstore.frontstore.ng -> /[username])
  if (subdomain && isPlatformDomain && !isSystemPath) {
    const segments = pathname.split('/').filter(Boolean);

    // Handle subdomain referral links (e.g. dbgstore.frontstore.ng/ref -> /ref/dbgstore)
    if (pathname === '/ref' || pathname === '/ref/') {
      url.pathname = `/ref/${subdomain}`;
      return NextResponse.rewrite(url);
    }

    // 1. storeusername.domain/category/product-slug -> /[username]/products/[product-slug]
    if (segments.length === 2 && segments[0] !== 'products' && segments[0] !== 'paymentlink' && segments[0] !== 'site') {
      url.pathname = `/${subdomain}/products/${segments[1]}`;
      return NextResponse.rewrite(url);
    }

    // 2. storeusername.domain/product-slug -> /[username]/products/[product-slug] (if 1 segment and not reserved)
    if (segments.length === 1 && segments[0] !== 'products' && segments[0] !== 'paymentlink' && segments[0] !== 'site') {
      url.pathname = `/${subdomain}/products/${segments[0]}`;
      return NextResponse.rewrite(url);
    }

    url.pathname = `/${subdomain}${pathname === '/' ? '' : pathname}`;
    return NextResponse.rewrite(url);
  }

  // Note: We allow direct path visits on main domain (e.g. frontstore.ng/storename)
  // so stores work reliably even if wildcard DNS (*.frontstore.ng) is not configured.
  // If a subdomain is accessed directly (e.g. storename.frontstore.ng), lines 112-135 rewrite it internally.

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
