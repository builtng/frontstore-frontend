import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Reserved subdomains — these must never be treated as storefronts.
const RESERVED_SUBDOMAINS = new Set([
  // Administrative & Management
  'admin', 'administrator', 'adm', 'superadmin', 'super-admin', 'super_admin', 'superuser', 'su',
  'owner', 'staff', 'moderator', 'mod', 'root', 'sys', 'system', 'manager', 'management',
  'dashboard', 'portal', 'control', 'panel', 'cpanel', 'whm', 'backoffice', 'console',

  // Core App & System
  'frontstore', 'front-store', 'main', 'master', 'platform', 'domain', 'subdomain',
  'site', 'website', 'web', 'home', 'index', 'track', 'app', 'application',

  // Auth & Accounts
  'auth', 'login', 'signin', 'signup', 'register', 'logout', 'signout',
  'session', 'sessions', 'oauth', 'sso', 'account', 'accounts',
  'profile', 'user', 'users', 'member', 'members',
  'client', 'clients', 'customer', 'customers', 'password', 'reset-password', 'verify',
  'verification', 'otp', 'token', 'setup', 'onboarding',

  // Infrastructure & Networking
  'www', 'www1', 'www2', 'www3', 'localhost', 'lvh', 'lvh.me',
  'dns', 'ns', 'ns1', 'ns2', 'ns3', 'ns4', 'ftp',
  'smtp', 'pop', 'imap', 'git', 'github', 'gitlab', 'server', 'host', 'proxy', 'vpn',

  // Environments & QA
  'dev', 'development', 'staging', 'test', 'testing', 'qa',
  'prod', 'production', 'demo', 'sandbox', 'beta', 'alpha', 'internal', 'debug',

  // APIs & Services
  'api', 'apis', 'v1', 'v2', 'v3', 'graphql', 'rest',
  'ws', 'websocket', 'webhook', 'webhooks',
  'cdn', 'static', 'assets', 'media', 'images', 'img', 'uploads', 'upload', 'files', 'download',

  // Billing & Payments
  'billing', 'pay', 'payment', 'payments', 'checkout', 'cart',
  'subscribe', 'subscription', 'pro', 'premium', 'store', 'shop', 'sales',
  'invoice', 'invoices', 'refund', 'refunds', 'wallet', 'withdraw', 'withdrawal', 'payout', 'payouts', 'transfer', 'balance',

  // Payment & Logistics Partners
  'paystack', 'flutterwave', 'stripe', 'shipbubble', 'interswitch', 'remita', 'monify', 'monnify',

  // Support & Documentation
  'support', 'help', 'helpdesk', 'contact', 'about', 'info',
  'faq', 'faqs', 'docs', 'documentation', 'guide', 'guides',
  'status', 'health', 'monitor', 'feedback', 'chat',
  'mail', 'email', 'newsletter', 'blog', 'news', 'press', 'ceo', 'founder', 'team',

  // Legal & Compliance
  'legal', 'terms', 'privacy', 'policy', 'tos',
  'security', 'abuse', 'compliance', 'copyright', 'fraud', 'trust', 'safety', 'report',

  // Brand / Platform Impersonation
  'official', 'verified', 'whatsapp', 'meta', 'facebook', 'instagram', 'tiktok', 'twitter', 'x',
  'google', 'apple', 'paypal', 'frontstoreofficial', 'frontstoresupport', 'frontstoreteam',

  // Marketing & Platform App Pages (from fe/src/app)
  'access-refused', 'activate', 'affiliate', 'appeal', 'appeals', 'audit', 'business', 'buyer', 'claim', 'confirm',
  'dmca', 'forgot-password', 'free-audit', 'integrations', 'marketplace', 'merchant', 'online-store',
  'pricing', 'record-keeping', 'ref', 'refund-policy', 'return-policy',
  'returns', 'share-pay', 'solutions', 'stores', 'tools', 'vs', 'why-frontstore',

  // Junk / Placeholders
  'null', 'undefined', 'none', 'nil', 'delete', 'deleted', 'remove', 'anonymous', 'unknown'
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
    pathname.startsWith('/appeal') ||
    /\.(png|jpg|jpeg|gif|svg|ico|css|js|json|txt|xml|woff|woff2|ttf|otf|html)$/i.test(pathname);

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

  const STORE_SUBPAGES = new Set(['products', 'paymentlink', 'site', 'reviews']);

  // Rewrite subdomain storefront requests internally (e.g. debugstore.frontstore.ng -> /[username])
  if (subdomain && isPlatformDomain && !isSystemPath) {
    const rawSegments = pathname.split('/').filter(Boolean);
    // If the path redundantly repeats the subdomain (e.g. faithjozzyglam.frontstore.ng/faithjozzyglam/reviews),
    // redirect directly to the clean URL (e.g. https://faithjozzyglam.frontstore.ng/reviews).
    if (rawSegments.length > 0 && rawSegments[0].toLowerCase() === subdomain.toLowerCase()) {
      const remainingSegments = rawSegments.slice(1);
      const cleanPath = remainingSegments.length > 0 ? `/${remainingSegments.join('/')}` : '/';
      return NextResponse.redirect(new URL(`${cleanPath}${search}`, request.url), 301);
    }

    const segments = rawSegments;

    // Handle subdomain referral links (e.g. dbgstore.frontstore.ng/ref -> /ref/dbgstore)
    if (pathname === '/ref' || pathname === '/ref/' || (segments.length === 1 && segments[0] === 'ref')) {
      url.pathname = `/ref/${subdomain}`;
      return NextResponse.rewrite(url);
    }

    // Handle store reviews (e.g. store.frontstore.ng/reviews -> /[username]/reviews)
    if (segments.length === 1 && segments[0] === 'reviews') {
      url.pathname = `/${subdomain}/reviews`;
      return NextResponse.rewrite(url);
    }

    // 1. storeusername.domain/category/product-slug -> /[username]/products/[product-slug]
    if (segments.length === 2 && !STORE_SUBPAGES.has(segments[0])) {
      url.pathname = `/${subdomain}/products/${segments[1]}`;
      return NextResponse.rewrite(url);
    }

    // 2. storeusername.domain/product-slug -> /[username]/products/[product-slug] (if 1 segment and not reserved subpage)
    if (segments.length === 1 && !STORE_SUBPAGES.has(segments[0])) {
      url.pathname = `/${subdomain}/products/${segments[0]}`;
      return NextResponse.rewrite(url);
    }

    const cleanPath = segments.length > 0 ? `/${segments.join('/')}` : '';
    url.pathname = `/${subdomain}${cleanPath}`;
    return NextResponse.rewrite(url);
  }

  // Redirect direct main-domain storefront visits to their subdomain
  // (e.g. frontstore.ng/iyennelsonsstore -> https://iyennelsonsstore.frontstore.ng)
  if (!subdomain && (isMainDomain || isLocalMain) && !isSystemPath) {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length >= 1) {
      const storeSlug = segments[0].toLowerCase();
      if (!RESERVED_SUBDOMAINS.has(storeSlug)) {
        const remainingSegments = segments.slice(1);
        const remainingPath = remainingSegments.length > 0 ? `/${remainingSegments.join('/')}` : '';

        if (isMainDomain) {
          const targetUrl = `https://${storeSlug}.frontstore.ng${remainingPath}${search}`;
          return NextResponse.redirect(targetUrl, 301);
        }

        if (isLocalMain) {
          const hostPort = hostname.includes(':') ? `:${hostname.split(':')[1]}` : '';
          const proto = request.nextUrl.protocol || 'http:';
          const targetUrl = `${proto}//${storeSlug}.${cleanHost}${hostPort}${remainingPath}${search}`;
          return NextResponse.redirect(targetUrl, 301);
        }
      }
    }
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
