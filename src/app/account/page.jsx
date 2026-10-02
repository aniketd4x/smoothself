import { Suspense } from 'react';
import AccountPage from '@/views/AccountPage';

export const metadata = { title: 'My Account | SmoothSelf' };

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center">Loading account...</div>}>
      <AccountPage />
    </Suspense>
  );
}