import './globals.css';
import Script from 'next/script';
import { AppProvider } from '@/context/AppContext';
import StorefrontShell from '@/components/StorefrontShell';

export const metadata = {
  title: 'SmoothSelf — Luxury Botanical Skincare & Body Lotions',
  description: 'Premium botanical formulations crafted for deep skin hydration, soothing textures, and long-lasting natural radiance.',
  icons: {
    icon: '/logo.webp',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1.0,
  maximumScale: 1.0,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Jost:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-white text-brand-text font-sans antialiased selection:bg-brand-primary selection:text-white">
        <AppProvider>
          <StorefrontShell>
            {children}
          </StorefrontShell>
        </AppProvider>
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
