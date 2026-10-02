import { Suspense } from 'react';
import ShopPage from '@/views/ShopPage';

export const metadata = { title: 'Shop Collection | SmoothSelf' };

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center">Loading shop...</div>}>
      <ShopPage />
    </Suspense>
  );
}