import type { Metadata, Viewport } from 'next';
import { Outfit, Nunito } from 'next/font/google';
import { Toaster } from '@loyalty/ui';
import { Providers } from './providers';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-outfit',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

const nunito = Nunito({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-nunito',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Portal Lojalnosciowy',
  description: 'Twoj portal lojalnosciowy - punkty, nagrody i karta stemplowa.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Portal Lojalnosciowy',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#c4653a',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl" className={`${outfit.variable} ${nunito.variable}`}>
      <body className="min-h-screen font-sans antialiased" style={{ fontFamily: 'var(--font-nunito), system-ui, sans-serif' }}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
