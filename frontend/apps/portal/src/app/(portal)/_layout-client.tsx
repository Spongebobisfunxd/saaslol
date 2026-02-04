'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@loyalty/store';
import {
  Home,
  Gift,
  Stamp,
  Clock,
  User,
} from 'lucide-react';
import { cn } from '@loyalty/ui';

const tabs = [
  { href: '/home', label: 'Start', icon: Home },
  { href: '/rewards', label: 'Nagrody', icon: Gift },
  { href: '/stamps', label: 'Stemple', icon: Stamp },
  { href: '/history', label: 'Historia', icon: Clock },
  { href: '/profile', label: 'Profil', icon: User },
] as const;

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: '#faf7f2' }}>
        <div
          className="h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"
          style={{ borderColor: '#c4653a', borderTopColor: 'transparent' }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#faf7f2' }}>
      {/* Main content area with bottom padding for nav */}
      <main className="organic-bg pb-24" style={{ minHeight: '100vh' }}>{children}</main>

      {/* Fixed bottom tab navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom"
        style={{
          background: 'rgba(253, 240, 231, 0.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderTop: '1px solid rgba(168, 146, 138, 0.2)',
        }}
      >
        <div className="mx-auto flex max-w-lg items-stretch justify-around px-1">
          {tabs.map((tab) => {
            const isActive =
              pathname === tab.href ||
              (tab.href !== '/home' && pathname.startsWith(tab.href));

            return (
              <button
                key={tab.href}
                onClick={() => router.push(tab.href)}
                className={cn(
                  'relative flex min-h-[60px] flex-1 flex-col items-center justify-center gap-0.5 px-1 py-2 text-xs font-medium transition-all duration-200',
                  isActive
                    ? 'nav-dot-active'
                    : '',
                )}
                style={{
                  color: isActive ? '#c4653a' : '#a8928a',
                }}
                aria-current={isActive ? 'page' : undefined}
              >
                {isActive && (
                  <div
                    className="absolute top-1 left-1/2 -translate-x-1/2 w-10 h-10 rounded-2xl opacity-10"
                    style={{ backgroundColor: '#c4653a' }}
                  />
                )}
                <tab.icon
                  className={cn(
                    'h-6 w-6 transition-all duration-200 relative z-10',
                    isActive && 'scale-110',
                  )}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
                <span
                  className={cn(
                    'relative z-10 transition-all duration-200',
                    isActive ? 'font-bold text-[11px]' : 'text-[11px]',
                  )}
                  style={{ fontFamily: 'var(--font-outfit), system-ui, sans-serif' }}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
