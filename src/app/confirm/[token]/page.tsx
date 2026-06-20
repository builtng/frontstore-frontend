import ConfirmLaunchClient from './ConfirmLaunchClient';

interface PageProps {
  params: Promise<{ token: string }>;
}

export const metadata = {
  title: 'Activate Your Store',
  description: 'Set your password to activate your store account.',
};

export default async function ConfirmLaunchPage({ params }: PageProps) {
  const { token } = await params;
  return <ConfirmLaunchClient token={token} />;
}
