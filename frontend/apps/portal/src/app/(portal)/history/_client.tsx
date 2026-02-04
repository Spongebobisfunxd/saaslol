'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '@loyalty/store';
import { useTransactions } from '@loyalty/api-client';
import { cn } from '@loyalty/ui';
import {
  ShoppingCart,
  Gift,
  ArrowUpCircle,
  ArrowDownCircle,
  Coffee,
  CreditCard,
  Star,
  Repeat,
} from 'lucide-react';

// ---------- Types ----------
type TransactionType = 'earn' | 'spend' | 'bonus' | 'refund' | 'purchase' | 'redemption';

interface TransactionDisplay {
  id: string;
  date: string;
  type: TransactionType;
  description: string;
  points: number;
  location?: string;
}

// ---------- Icons per type ----------
const TYPE_ICONS: Record<string, typeof ShoppingCart> = {
  earn: ShoppingCart,
  purchase: ShoppingCart,
  spend: Gift,
  redemption: Gift,
  bonus: Star,
  refund: Repeat,
};

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  earn: { bg: 'rgba(107, 143, 107, 0.15)', text: '#6b8f6b' },
  purchase: { bg: 'rgba(107, 143, 107, 0.15)', text: '#6b8f6b' },
  spend: { bg: 'rgba(196, 101, 58, 0.12)', text: '#c4653a' },
  redemption: { bg: 'rgba(196, 101, 58, 0.12)', text: '#c4653a' },
  bonus: { bg: 'rgba(196, 161, 58, 0.15)', text: '#a88832' },
  refund: { bg: 'rgba(168, 146, 138, 0.15)', text: '#8b7b73' },
};

// ---------- Format helpers ----------
function formatDate(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return 'Dzisiaj';
  if (d.toDateString() === yesterday.toDateString()) return 'Wczoraj';

  return d.toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'short',
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('pl-PL', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ---------- Transaction row ----------
function TransactionRow({ tx }: { tx: TransactionDisplay }) {
  const Icon = TYPE_ICONS[tx.type] || ShoppingCart;
  const colors = TYPE_COLORS[tx.type] || TYPE_COLORS.earn;
  const isPositive = tx.points > 0;

  return (
    <div className="flex items-center gap-3 px-4 py-3 active:bg-black/[0.02] transition-colors">
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
        style={{ background: colors.bg, color: colors.text }}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate" style={{ color: '#3d2c22' }}>{tx.description}</p>
        <p className="text-xs" style={{ color: '#a8928a' }}>
          {formatDate(tx.date)} {formatTime(tx.date)}
          {tx.location && ` \u2022 ${tx.location}`}
        </p>
      </div>
      <span
        className="text-sm font-bold shrink-0"
        style={{ color: isPositive ? '#6b8f6b' : '#c4653a' }}
      >
        {isPositive ? '+' : ''}
        {tx.points}
      </span>
    </div>
  );
}

// ---------- Map API type to display type ----------
function mapTransactionType(apiType: string, pointsEarned: number, pointsSpent: number): TransactionType {
  const lower = apiType.toLowerCase();
  if (lower === 'purchase' || lower === 'earn') return 'purchase';
  if (lower === 'redemption' || lower === 'spend') return 'redemption';
  if (lower === 'bonus') return 'bonus';
  if (lower === 'refund') return 'refund';
  // Fallback based on points
  if (pointsEarned > 0) return 'earn';
  if (pointsSpent > 0) return 'spend';
  return 'earn';
}

// ---------- Page ----------
type FilterTab = 'all' | 'earned' | 'spent';

export default function HistoryPage() {
  const { user } = useAuthStore();
  const [filter, setFilter] = useState<FilterTab>('all');
  const [page, setPage] = useState(1);
  const [allTransactions, setAllTransactions] = useState<TransactionDisplay[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, error } = useTransactions({
    customerId: user?.id,
    page,
    limit: 15,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Append new page data to accumulated list
  useEffect(() => {
    if (data?.data) {
      const mapped: TransactionDisplay[] = data.data.map((tx: any) => {
        const type = mapTransactionType(tx.type, tx.pointsEarned, tx.pointsSpent);
        const netPoints = (tx.pointsEarned || 0) - (tx.pointsSpent || 0);
        return {
          id: tx.id,
          date: tx.createdAt,
          type,
          description: tx.description || (netPoints >= 0 ? 'Transakcja' : 'Wydanie punktow'),
          points: netPoints,
        };
      });

      setAllTransactions((prev) => {
        // Avoid duplicates when query refetches
        const existingIds = new Set(prev.map((t) => t.id));
        const newItems = mapped.filter((t) => !existingIds.has(t.id));
        return [...prev, ...newItems];
      });

      // Check if there are more pages
      if (data.page >= data.totalPages || data.data.length === 0) {
        setHasMore(false);
      }
    }
  }, [data]);

  // Filter transactions
  const filteredTransactions = allTransactions.filter((tx) => {
    if (filter === 'earned') return tx.points > 0;
    if (filter === 'spent') return tx.points < 0;
    return true;
  });

  // Infinite scroll
  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;
    setPage((prev) => prev + 1);
  }, [isLoading, hasMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 },
    );

    const el = observerRef.current;
    if (el) observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
    };
  }, [loadMore]);

  // Group transactions by date
  const grouped = filteredTransactions.reduce<Record<string, TransactionDisplay[]>>(
    (acc, tx) => {
      const key = formatDate(tx.date);
      if (!acc[key]) acc[key] = [];
      acc[key].push(tx);
      return acc;
    },
    {},
  );

  return (
    <div className="space-y-0">
      {/* Header */}
      <div className="px-4 pt-12 pb-4" style={{ background: '#fdf0e7', borderBottom: '1px solid rgba(168, 146, 138, 0.15)' }}>
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-outfit), system-ui, sans-serif', color: '#3d2c22' }}>
          Historia
        </h1>
        <p className="text-sm mt-1" style={{ color: '#a8928a' }}>
          Twoje transakcje punktowe
        </p>
      </div>

      {/* Filter tabs */}
      <div className="px-4 py-3" style={{ background: '#fdf0e7', borderBottom: '1px solid rgba(168, 146, 138, 0.1)' }}>
        <div className="flex gap-2">
          {[
            { key: 'all' as const, label: 'Wszystkie' },
            { key: 'earned' as const, label: 'Zdobyte' },
            { key: 'spent' as const, label: 'Wydane' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className="rounded-full px-4 py-2 text-sm font-medium min-h-[40px] transition-all"
              style={{
                background: filter === tab.key
                  ? 'linear-gradient(135deg, #c4653a, #8b4528)'
                  : 'rgba(168, 146, 138, 0.1)',
                color: filter === tab.key ? '#faf7f2' : '#a8928a',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="px-4 py-8 text-center">
          <p className="text-sm" style={{ color: '#c44a3a' }}>Nie udalo sie zaladowac historii transakcji.</p>
        </div>
      )}

      {/* Initial loading state */}
      {isLoading && allTransactions.length === 0 && (
        <div className="px-4 py-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-3 animate-pulse">
              <div className="h-11 w-11 rounded-2xl" style={{ background: 'rgba(168, 146, 138, 0.2)' }} />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-40 rounded" style={{ background: 'rgba(168, 146, 138, 0.2)' }} />
                <div className="h-3 w-24 rounded" style={{ background: 'rgba(168, 146, 138, 0.2)' }} />
              </div>
              <div className="h-4 w-12 rounded" style={{ background: 'rgba(168, 146, 138, 0.2)' }} />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && allTransactions.length === 0 && (
        <div className="px-4 py-8 text-center">
          <p className="text-sm" style={{ color: '#a8928a' }}>Brak transakcji do wyswietlenia</p>
        </div>
      )}

      {/* Transaction list */}
      {Object.keys(grouped).length > 0 && (
        <div className="divide-y" style={{ borderColor: 'rgba(168, 146, 138, 0.1)' }}>
          {Object.entries(grouped).map(([dateLabel, txs]) => (
            <div key={dateLabel}>
              <div className="sticky top-0 z-10 px-4 py-2" style={{ background: '#faf7f2' }}>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#a8928a' }}>
                  {dateLabel}
                </p>
              </div>
              <div style={{ background: '#fdf0e7' }}>
                {txs.map((tx, idx) => (
                  <div key={tx.id}>
                    {idx > 0 && <div className="divider-organic mx-4" />}
                    <TransactionRow tx={tx} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Infinite scroll sentinel */}
      <div ref={observerRef} className="flex justify-center py-6">
        {isLoading && allTransactions.length > 0 && (
          <div
            className="h-6 w-6 animate-spin rounded-full border-2 border-t-transparent"
            style={{ borderColor: '#c4653a', borderTopColor: 'transparent' }}
          />
        )}
        {!hasMore && allTransactions.length > 0 && (
          <p className="text-sm" style={{ color: '#a8928a' }}>
            To juz wszystkie transakcje
          </p>
        )}
      </div>
    </div>
  );
}
