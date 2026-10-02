'use client';

import React, { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import BottomNavigator from './BottomNavigator';
import CartDrawer from './CartDrawer';
import QuickViewModal from './QuickViewModal';
import SearchModal from './SearchModal';
import Toast from './Toast';

export default function StorefrontShell({ children }) {
  const pathname = usePathname() || '/';
  const isAdminPath = pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Suspense fallback={<div className="h-16" />}>
        {!isAdminPath && <Header />}
      </Suspense>

      <main className="flex-1 pb-16 md:pb-0">
        <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center" />}>
          {children}
        </Suspense>
      </main>

      {!isAdminPath && <Footer />}

      <Suspense fallback={null}>
        {!isAdminPath && <BottomNavigator />}
      </Suspense>

      <CartDrawer />
      <QuickViewModal />
      <SearchModal />
      <Toast />
    </div>
  );
}
