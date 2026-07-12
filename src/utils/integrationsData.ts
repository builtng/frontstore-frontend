export interface IntegrationEntry {
  id: string;
  name: string;
  category: 'Analytics & Ad Pixels' | 'Email Marketing' | 'Automation' | 'Notifications' | 'Courses & Membership';
  description: string;
  status: 'live';
  hue: number;
}

export const INTEGRATIONS: IntegrationEntry[] = [
  {
    id: 'facebook-pixel',
    name: 'Facebook Pixel',
    category: 'Analytics & Ad Pixels',
    description: 'Track conversions and page views on every storefront visit to improve your Facebook & Instagram Ads.',
    status: 'live',
    hue: 221,
  },
  {
    id: 'google-tag-manager',
    name: 'Google Tag Manager',
    category: 'Analytics & Ad Pixels',
    description: 'Full control of your store\'s tracking scripts — connect Google Analytics and any third-party tag without touching code.',
    status: 'live',
    hue: 28,
  },
  {
    id: 'tiktok-pixel',
    name: 'TikTok Pixel',
    category: 'Analytics & Ad Pixels',
    description: 'Track conversions and key events to optimize your TikTok Ads for better performance.',
    status: 'live',
    hue: 340,
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    category: 'Email Marketing',
    description: 'Every paid order automatically syncs the buyer into your Mailchimp audience.',
    status: 'live',
    hue: 45,
  },
  {
    id: 'sendpulse',
    name: 'SendPulse',
    category: 'Email Marketing',
    description: 'Sync buyers into a SendPulse address book the moment they pay.',
    status: 'live',
    hue: 200,
  },
  {
    id: 'convertkit',
    name: 'ConvertKit',
    category: 'Email Marketing',
    description: 'Subscribe buyers to a ConvertKit form automatically after checkout.',
    status: 'live',
    hue: 300,
  },
  {
    id: 'mailerlite',
    name: 'MailerLite',
    category: 'Email Marketing',
    description: 'Add buyers to a MailerLite group after every paid order.',
    status: 'live',
    hue: 168,
  },
  {
    id: 'zapier',
    name: 'Zapier',
    category: 'Automation',
    description: 'Send a webhook for every paid order and connect Frontstore to thousands of apps.',
    status: 'live',
    hue: 15,
  },
  {
    id: 'telegram',
    name: 'Telegram',
    category: 'Notifications',
    description: 'Get a Telegram message in your own chat the instant you make a sale.',
    status: 'live',
    hue: 199,
  },
  {
    id: 'thinkific',
    name: 'Thinkific',
    category: 'Courses & Membership',
    description: 'Automatically enroll buyers into a Thinkific course after they pay.',
    status: 'live',
    hue: 258,
  },
  {
    id: 'kartra',
    name: 'Kartra',
    category: 'Courses & Membership',
    description: 'Add buyers to a Kartra list so an automation can grant product, service, or membership access.',
    status: 'live',
    hue: 6,
  },
];

export const INTEGRATION_CATEGORIES = [
  'Analytics & Ad Pixels',
  'Email Marketing',
  'Automation',
  'Notifications',
  'Courses & Membership',
] as const;
