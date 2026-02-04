import type { Metadata } from 'next';
import { DM_Serif_Display, DM_Sans } from 'next/font/google';
import { Toaster } from '@loyalty/ui';
import { Providers } from './providers';
import './globals.css';

const dmSerifDisplay = DM_Serif_Display({
  weight: '400',
  subsets: ['latin', 'latin-ext'],
  variable: '--font-dm-serif',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-dm-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Loyalty SaaS Dashboard',
  description: 'Manage your loyalty programs, customers, rewards, and analytics.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl" className={`${dmSerifDisplay.variable} ${dmSans.variable}`}>
      <body className="min-h-screen font-sans antialiased" style={{ fontFamily: 'var(--font-dm-sans), system-ui, sans-serif' }}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
