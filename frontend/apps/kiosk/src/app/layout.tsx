import type { Metadata, Viewport } from 'next';
import { Sora } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const sora = Sora({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700', '800'] });

export const metadata: Metadata = {
  title: 'Loyalty Kiosk',
  description: 'Self-service loyalty kiosk for customers',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Loyalty Kiosk',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="screen-orientation" content="landscape" />
        <meta name="theme-color" content="#06060a" />
      </head>
      <body
        className={`${sora.className} kiosk-mode h-full`}
        style={{ background: '#06060a' }}
      >
        <Providers>
          <main className="h-screen w-screen overflow-hidden">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
