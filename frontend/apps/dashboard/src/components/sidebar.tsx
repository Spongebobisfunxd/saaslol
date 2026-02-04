'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUIStore } from '@loyalty/store';
import { useAuthStore } from '@loyalty/store';
import { useLogout } from '@loyalty/api-client';
import { cn } from '@loyalty/ui';
import {
  Button,
  Avatar,
  AvatarFallback,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  Separator,
} from '@loyalty/ui';
import {
  LayoutDashboard,
  Users,
  Star,
  Gift,
  Stamp,
  Megaphone,
  CreditCard,
  Ticket,
  BarChart3,
  MapPin,
  Puzzle,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Klienci', href: '/customers', icon: Users },
  { label: 'Programy lojalnosciowe', href: '/programs', icon: Star },
  { label: 'Nagrody', href: '/rewards', icon: Gift },
  { label: 'Karty stemplowe', href: '/stamps', icon: Stamp },
  { label: 'Kampanie', href: '/campaigns', icon: Megaphone },
  { label: 'Karty podarunkowe', href: '/gift-cards', icon: CreditCard },
  { label: 'Vouchery', href: '/vouchers', icon: Ticket },
  { label: 'Analityka', href: '/analytics', icon: BarChart3 },
  { label: 'Lokalizacje', href: '/locations', icon: MapPin },
  { label: 'Integracje', href: '/integrations', icon: Puzzle },
  { label: 'Ustawienia', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { user } = useAuthStore();
  const logoutMutation = useLogout();

  const initials = user
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
    : 'U';

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <aside
      className={cn(
        'relative flex flex-col transition-all duration-300',
        sidebarOpen ? 'w-64' : 'w-16',
      )}
      style={{
        backgroundColor: 'var(--surface)',
        borderRight: '1px solid rgba(212, 168, 83, 0.08)',
      }}
    >
      {/* Logo */}
      <div
        className="flex h-16 items-center gap-3 px-4"
        style={{ borderBottom: '1px solid rgba(212, 168, 83, 0.08)' }}
      >
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm"
          style={{
            background: 'linear-gradient(135deg, var(--gold), var(--gold-dim))',
            color: 'var(--charcoal)',
            fontFamily: 'var(--font-dm-serif), Georgia, serif',
            fontWeight: 'bold',
            boxShadow: '0 2px 8px rgba(212, 168, 83, 0.2)',
          }}
        >
          L
        </div>
        {sidebarOpen && (
          <span
            className="text-lg tracking-tight"
            style={{
              fontFamily: 'var(--font-dm-serif), Georgia, serif',
              color: 'var(--cream)',
            }}
          >
            Loyalty
          </span>
        )}
      </div>

      {/* Toggle button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 z-10 h-6 w-6 rounded-full border-0"
        style={{
          backgroundColor: 'var(--surface-elevated)',
          color: 'var(--warm-gray)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(212, 168, 83, 0.1)',
        }}
      >
        {sidebarOpen ? (
          <ChevronLeft className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
      </Button>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
        {navItems.map((item) => {
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200',
                isActive
                  ? 'active-indicator'
                  : 'hover:bg-[rgba(212,168,83,0.04)]',
                !sidebarOpen && 'justify-center px-2',
              )}
              style={{
                color: isActive ? 'var(--gold)' : 'var(--warm-gray)',
                backgroundColor: isActive ? 'rgba(212, 168, 83, 0.08)' : undefined,
                fontWeight: isActive ? 500 : 400,
              }}
              title={!sidebarOpen ? item.label : undefined}
            >
              <item.icon
                className="h-[18px] w-[18px] shrink-0 transition-colors duration-200"
                style={{
                  color: isActive ? 'var(--gold)' : undefined,
                }}
              />
              {sidebarOpen && (
                <span className="truncate">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User menu */}
      <div
        className="p-3"
        style={{ borderTop: '1px solid rgba(212, 168, 83, 0.08)' }}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200',
                !sidebarOpen && 'justify-center px-2',
              )}
              style={{ color: 'var(--cream)' }}
            >
              <Avatar className="h-8 w-8 shrink-0">
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
              {sidebarOpen && user && (
                <div className="flex flex-col items-start overflow-hidden">
                  <span className="truncate font-medium" style={{ color: 'var(--cream)' }}>
                    {user.firstName} {user.lastName}
                  </span>
                  <span className="truncate text-xs" style={{ color: 'var(--warm-gray)' }}>
                    {user.email}
                  </span>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 border-0"
            style={{
              backgroundColor: 'var(--surface-elevated)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(212, 168, 83, 0.08)',
            }}
          >
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
    </aside>
  );
}
