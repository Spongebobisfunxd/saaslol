'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@loyalty/store';
import { useLogout } from '@loyalty/api-client';
import { cn } from '@loyalty/ui';
import {
  Button,
  Input,
  Avatar,
  AvatarFallback,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@loyalty/ui';
import { Search, Bell, LogOut, User, Settings } from 'lucide-react';

const breadcrumbMap: Record<string, string> = {
  dashboard: 'Dashboard',
  customers: 'Klienci',
  programs: 'Programy lojalnosciowe',
  rewards: 'Nagrody',
  stamps: 'Karty stemplowe',
  campaigns: 'Kampanie',
  'gift-cards': 'Karty podarunkowe',
  vouchers: 'Vouchery',
  analytics: 'Analityka',
  locations: 'Lokalizacje',
  integrations: 'Integracje',
  settings: 'Ustawienia',
};

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthStore();
  const logoutMutation = useLogout();

  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs = segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/');
    const label = breadcrumbMap[segment] || segment;
    return { href, label };
  });

  const initials = user
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
    : 'U';

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        router.push('/login');
      },
    });
  };

  return (
    <header
      className="flex h-16 shrink-0 items-center justify-between px-6"
      style={{
        backgroundColor: 'var(--surface)',
        borderBottom: '1px solid rgba(212, 168, 83, 0.08)',
      }}
    >
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm">
        {breadcrumbs.map((crumb, index) => (
          <span key={crumb.href} className="flex items-center gap-1.5">
            {index > 0 && (
              <span style={{ color: 'rgba(212, 168, 83, 0.3)' }}>/</span>
            )}
            {index === breadcrumbs.length - 1 ? (
              <span
                className="font-medium"
                style={{
                  color: 'var(--cream)',
                  fontFamily: index === breadcrumbs.length - 1 && breadcrumbs.length > 1
                    ? 'var(--font-dm-serif), Georgia, serif'
                    : undefined,
                }}
              >
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="transition-colors duration-200"
                style={{ color: 'var(--warm-gray)' }}
              >
                {crumb.label}
              </Link>
            )}
          </span>
        ))}
      </nav>

      {/* Right side actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
            style={{ color: 'var(--warm-gray)' }}
          />
          <Input
            type="search"
            placeholder="Szukaj..."
            className="w-64 border-0 pl-9"
            style={{
              backgroundColor: 'var(--surface-elevated)',
              color: 'var(--cream)',
              borderRadius: 'var(--radius)',
            }}
          />
        </div>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative border-0"
          style={{ color: 'var(--warm-gray)' }}
        >
          <Bell className="h-4 w-4" />
          <span
            className="pulse-dot absolute right-1.5 top-1.5 h-2 w-2 rounded-full"
            style={{ backgroundColor: 'var(--gold)' }}
          />
        </Button>

        {/* Divider */}
        <div
          className="mx-1 h-6 w-px"
          style={{ backgroundColor: 'rgba(212, 168, 83, 0.1)' }}
        />

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 border-0 px-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback
                  className="text-xs"
                  style={{
                    backgroundColor: 'rgba(212, 168, 83, 0.12)',
                    color: 'var(--gold)',
                    fontWeight: 600,
                  }}
                >
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span
                className="hidden text-sm font-medium md:inline-block"
                style={{ color: 'var(--cream)' }}
              >
                {user?.firstName} {user?.lastName}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 border-0"
            style={{
              backgroundColor: 'var(--surface-elevated)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(212, 168, 83, 0.08)',
            }}
          >
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium" style={{ color: 'var(--cream)' }}>
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs" style={{ color: 'var(--warm-gray)' }}>
                {user?.email}
              </p>
            </div>
            <DropdownMenuSeparator style={{ backgroundColor: 'rgba(212, 168, 83, 0.08)' }} />
            <DropdownMenuItem asChild>
              <Link href="/settings" style={{ color: 'var(--cream)' }}>
                <User className="mr-2 h-4 w-4" style={{ color: 'var(--warm-gray)' }} />
                Profil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" style={{ color: 'var(--cream)' }}>
                <Settings className="mr-2 h-4 w-4" style={{ color: 'var(--warm-gray)' }} />
                Ustawienia
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator style={{ backgroundColor: 'rgba(212, 168, 83, 0.08)' }} />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Wyloguj sie
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
