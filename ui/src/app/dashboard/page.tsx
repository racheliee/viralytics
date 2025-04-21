'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isLoggedIn } from '@viralytics/utils/auth';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push('/');
    }
  }, [router]);

  return (
    <div>
      <h1 className="text-xl font-bold">Welcome to your dashboard!</h1>
    </div>
  );
}
