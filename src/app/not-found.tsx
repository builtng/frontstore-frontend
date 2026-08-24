import type { Metadata } from 'next';
import NotFoundClient from './NotFoundClient';

export const metadata: Metadata = {
  title: '404: Page Not Found | Front Store',
  description: 'The page, storefront, or product you requested could not be found on Front Store. Browse merchant stores, compare prices, or return home.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return <NotFoundClient />;
}
