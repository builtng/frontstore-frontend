'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function RefPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const referrerUsername = params?.referrer as string;

    if (!referrerUsername) {
      router.replace('/');
      return;
    }

    // Store the referrer username in localStorage
    localStorage.setItem('referrer_username', referrerUsername);

    // Redirect to signup page with referrer info
    router.replace(`/signup?ref=${referrerUsername}`);
  }, [params, router]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center' }}>
        <p>Redirecting...</p>
      </div>
    </div>
  );
}
