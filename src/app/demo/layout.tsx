import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Live Demo',
  description: 'Explore the Frontstore merchant dashboard with sample data — no signup, no sales call required.',
  alternates: {
    canonical: '/demo',
  },
};

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
