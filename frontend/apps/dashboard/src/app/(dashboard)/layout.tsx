'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@loyalty/store';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, tokens } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !tokens?.accessToken) {
      router.push('/login');
    }
  }, [isAuthenticated, tokens, router]);

  if (!isAuthenticated || !tokens?.accessToken) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ backgroundColor: 'var(--charcoal)' }}
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className="h-10 w-10 animate-spin rounded-full border-[3px]"
            style={{
              borderColor: 'rgba(212, 168, 83, 0.15)',
              borderTopColor: 'var(--gold)',
            }}
          />
          <span
            className="text-sm tracking-wide"
            style={{ color: 'var(--warm-gray)' }}
          >
            Ladowanie...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ backgroundColor: 'var(--charcoal)' }}
    >
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main
          className="flex-1 overflow-y-auto p-6"
          style={{ backgroundColor: 'var(--charcoal)' }}
        >
          <div className="fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
