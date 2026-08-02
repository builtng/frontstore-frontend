import ActivateAccountClient from './ActivateAccountClient';

interface PageProps {
  params: Promise<{ token: string }>;
}

export const metadata = {
  title: 'Activate Your Account',
  description: 'Verify your email to activate your store and generate your payment account.',
};

export default async function ActivateAccountPage({ params }: PageProps) {
  const { token } = await params;
  return <ActivateAccountClient token={token} />;
}
