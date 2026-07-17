// Keep this list in sync with be/config/reserved_usernames.php
export const RESERVED_SUBDOMAINS = [
  // Administrative & Management
  'admin', 'administrator', 'adm', 'superadmin', 'super-admin', 'super_admin', 'superuser', 'su',
  'owner', 'staff', 'moderator', 'mod', 'root', 'sys', 'system', 'manager', 'management',
  'dashboard', 'portal', 'control', 'panel', 'cpanel', 'whm', 'backoffice', 'console',

  // Core App & System
  'frontstore', 'front-store', 'main', 'master', 'platform', 'domain', 'subdomain', 'site',
  'website', 'web', 'home', 'index', 'track', 'app', 'application',

  // Auth & Accounts
  'auth', 'login', 'signin', 'signup', 'register', 'logout', 'signout', 'session', 'sessions',
  'oauth', 'sso', 'account', 'accounts', 'profile', 'user', 'users', 'member', 'members',
  'client', 'clients', 'customer', 'customers', 'password', 'reset-password', 'verify',
  'verification', 'otp', 'token', 'setup', 'onboarding',

  // Infrastructure & Networking
  'www', 'www1', 'www2', 'www3', 'localhost', 'lvh.me', 'dns', 'ns', 'ns1', 'ns2', 'ns3', 'ns4',
  'ftp', 'smtp', 'pop', 'imap', 'git', 'github', 'gitlab', 'server', 'host', 'proxy', 'vpn',

  // Environments & QA
  'dev', 'development', 'staging', 'test', 'testing', 'qa', 'prod', 'production', 'demo',
  'sandbox', 'beta', 'alpha', 'internal', 'debug',

  // APIs & Services
  'api', 'apis', 'v1', 'v2', 'v3', 'graphql', 'rest', 'ws', 'websocket', 'webhook', 'webhooks',
  'cdn', 'static', 'assets', 'media', 'images', 'img', 'uploads', 'upload', 'files', 'download',

  // Billing & Payments
  'billing', 'pay', 'payment', 'payments', 'checkout', 'cart', 'subscribe', 'subscription',
  'pro', 'premium', 'store', 'shop', 'sales', 'invoice', 'invoices', 'refund', 'refunds',
  'wallet', 'withdraw', 'withdrawal', 'payout', 'payouts', 'transfer', 'balance',

  // Payment & Logistics Partner Impersonation
  'paystack', 'flutterwave', 'stripe', 'shipbubble', 'interswitch', 'remita', 'monify', 'monnify',

  // Support & Documentation
  'support', 'help', 'helpdesk', 'contact', 'about', 'info', 'faq', 'faqs', 'docs',
  'documentation', 'guide', 'guides', 'status', 'health', 'monitor', 'feedback', 'chat',
  'mail', 'email', 'newsletter', 'blog', 'news', 'press', 'ceo', 'founder', 'team',

  // Legal & Compliance
  'legal', 'terms', 'privacy', 'policy', 'tos', 'security', 'abuse', 'compliance', 'copyright',
  'dmca', 'fraud', 'trust', 'safety', 'report',

  // Brand / Platform Impersonation
  'official', 'verified', 'whatsapp', 'meta', 'facebook', 'instagram', 'tiktok', 'twitter', 'x',
  'google', 'apple', 'paypal', 'frontstoreofficial', 'frontstoresupport', 'frontstoreteam',

  // Junk / Placeholder values
  'null', 'undefined', 'none', 'nil', 'delete', 'deleted', 'remove', 'anonymous', 'unknown',
];
