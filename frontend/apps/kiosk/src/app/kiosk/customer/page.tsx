'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Plus,
  Gift,
  Stamp,
  Wallet,
  Star,
  Crown,
  UserPlus,
  Loader2,
} from 'lucide-react';
import { Numpad } from '@/components/numpad';
import { addPendingOperation, getCachedCustomerByPhone } from '@/lib/sync-engine';
import { getKioskDB } from '@/lib/db';

interface CustomerData {
  id: string;
  name: string;
  phone: string;
  points: number;
  tier: string;
  stamps: number;
  totalStamps: number;
  availableRewards: { id: string; name: string; pointsCost: number }[];
}

type ActionMode = null | 'add-points' | 'redeem' | 'add-stamp' | 'balance';

export default function CustomerPage() {
  return (
    <Suspense fallback={
      <div className="flex h-full w-full items-center justify-center">
        <div className="neon-pulse h-14 w-14 rounded-full" style={{ border: '3px solid rgba(0, 212, 255, 0.2)', borderTopColor: '#00d4ff', animation: 'spin 1s linear infinite, neon-pulse 3s ease-in-out infinite' }}>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    }>
      <CustomerContent />
    </Suspense>
  );
}

function CustomerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerId = searchParams.get('id');
  const isOffline = searchParams.get('offline') === 'true';

  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionMode, setActionMode] = useState<ActionMode>(null);
  const [amountValue, setAmountValue] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    async function loadCustomer() {
      if (!customerId) {
        router.replace('/kiosk');
        return;
      }

      try {
        if (!isOffline && navigator.onLine) {
          const deviceToken = localStorage.getItem('kiosk-device-token') || '';
          const response = await fetch(`/api/kiosk/customer/${customerId}`, {
            headers: { 'X-Device-Token': deviceToken },
          });
          if (response.ok) {
            const data = await response.json();
            setCustomer(data);
            setLoading(false);
            return;
          }
        }

        // Load from IndexedDB cache
        const db = await getKioskDB();
        const cached = await db.get('cachedCustomers', customerId);
        if (cached) {
          setCustomer(cached.data);
        }
      } catch {
        // Try cache on error
        const db = await getKioskDB();
        const cached = await db.get('cachedCustomers', customerId);
        if (cached) {
          setCustomer(cached.data);
        }
      } finally {
        setLoading(false);
      }
    }

    loadCustomer();
  }, [customerId, isOffline, router]);

  const handleAddPoints = async () => {
    if (!amountValue || !customer) return;
    setProcessing(true);

    try {
      await addPendingOperation({
        operation: 'ADD_POINTS',
        payload: {
          customerId: customer.id,
          amount: parseInt(amountValue, 10),
        },
      });

      router.push(
        `/kiosk/confirm?type=success&message=${encodeURIComponent(
          `+${amountValue} points added`
        )}&customer=${encodeURIComponent(customer.name)}`
      );
    } catch {
      router.push(
        `/kiosk/confirm?type=error&message=${encodeURIComponent(
          'Failed to add points'
        )}`
      );
    }
  };

  const handleRedeemReward = async (rewardId: string, rewardName: string) => {
    if (!customer) return;
    setProcessing(true);

    try {
      await addPendingOperation({
        operation: 'REDEEM_REWARD',
        payload: {
          customerId: customer.id,
          rewardId,
        },
      });

      router.push(
        `/kiosk/confirm?type=success&message=${encodeURIComponent(
          `Redeemed: ${rewardName}`
        )}&customer=${encodeURIComponent(customer.name)}`
      );
    } catch {
      router.push(
        `/kiosk/confirm?type=error&message=${encodeURIComponent(
          'Failed to redeem reward'
        )}`
      );
    }
  };

  const handleAddStamp = async () => {
    if (!customer) return;
    setProcessing(true);

    try {
      await addPendingOperation({
        operation: 'ADD_STAMP',
        payload: {
          customerId: customer.id,
        },
      });

      router.push(
        `/kiosk/confirm?type=success&message=${encodeURIComponent(
          'Stamp added!'
        )}&customer=${encodeURIComponent(customer.name)}`
      );
    } catch {
      router.push(
        `/kiosk/confirm?type=error&message=${encodeURIComponent(
          'Failed to add stamp'
        )}`
      );
    }
  };

  const tierStyles: Record<string, { bg: string; border: string; text: string; glow: string }> = {
    Bronze: {
      bg: 'rgba(180, 120, 60, 0.15)',
      border: 'rgba(180, 120, 60, 0.4)',
      text: '#d4a574',
      glow: '0 0 10px rgba(180, 120, 60, 0.3)',
    },
    Silver: {
      bg: 'rgba(192, 192, 210, 0.15)',
      border: 'rgba(192, 192, 210, 0.4)',
      text: '#c0c0d2',
      glow: '0 0 10px rgba(192, 192, 210, 0.3)',
    },
    Gold: {
      bg: 'rgba(255, 215, 0, 0.15)',
      border: 'rgba(255, 215, 0, 0.4)',
      text: '#ffd700',
      glow: '0 0 10px rgba(255, 215, 0, 0.3)',
    },
    Platinum: {
      bg: 'rgba(0, 212, 255, 0.15)',
      border: 'rgba(0, 212, 255, 0.4)',
      text: '#00d4ff',
      glow: '0 0 10px rgba(0, 212, 255, 0.3)',
    },
  };

  const defaultTierStyle = {
    bg: 'rgba(0, 212, 255, 0.1)',
    border: 'rgba(0, 212, 255, 0.3)',
    text: '#00d4ff',
    glow: '0 0 10px rgba(0, 212, 255, 0.2)',
  };

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-16 w-16 rounded-full" style={{ border: '3px solid rgba(0, 212, 255, 0.2)', borderTopColor: '#00d4ff', animation: 'spin 1s linear infinite' }}>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-6">
        <p className="text-2xl font-light" style={{ color: '#4a5568' }}>Customer not found</p>
        <button
          onClick={() => router.push('/kiosk')}
          className="btn-futuristic-ghost touch-target px-10 text-xl font-semibold"
        >
          Back
        </button>
      </div>
    );
  }

  // Balance detail view
  if (actionMode === 'balance') {
    return (
      <div className="flex h-full w-full flex-col px-8 pb-8">
        <div className="mb-6 text-center">
          <h2 className="text-glow-cyan text-4xl font-bold" style={{ color: '#e8edf4' }}>{customer.name}</h2>
          <p className="mt-1 text-xl font-light" style={{ color: '#4a5568' }}>Balance Details</p>
        </div>

        <div className="mx-auto grid w-full max-w-3xl flex-1 grid-cols-2 gap-6">
          <div className="holo-card flex flex-col items-center justify-center p-8">
            <Star className="h-12 w-12" style={{ color: '#00d4ff', filter: 'drop-shadow(0 0 10px rgba(0, 212, 255, 0.5))' }} fill="currentColor" />
            <p className="text-glow-cyan mt-4 text-6xl font-bold" style={{ color: '#00d4ff' }}>
              {customer.points.toLocaleString()}
            </p>
            <p className="mt-2 text-xl font-light" style={{ color: '#4a5568' }}>Points Balance</p>
          </div>

          <div className="holo-card flex flex-col items-center justify-center p-8">
            <Crown className="h-12 w-12" style={{ color: '#00d4ff', filter: 'drop-shadow(0 0 10px rgba(0, 212, 255, 0.5))' }} />
            <p className="text-glow-cyan mt-4 text-4xl font-bold" style={{ color: '#e8edf4' }}>{customer.tier}</p>
            <p className="mt-2 text-xl font-light" style={{ color: '#4a5568' }}>Current Tier</p>
          </div>

          <div className="holo-card flex flex-col items-center justify-center p-8">
            <Stamp className="h-12 w-12" style={{ color: '#00ff88', filter: 'drop-shadow(0 0 10px rgba(0, 255, 136, 0.5))' }} />
            <p className="text-glow-emerald mt-4 text-5xl font-bold" style={{ color: '#00ff88' }}>
              {customer.stamps}/{customer.totalStamps}
            </p>
            <p className="mt-2 text-xl font-light" style={{ color: '#4a5568' }}>Stamps</p>
          </div>

          <div className="holo-card flex flex-col items-center justify-center p-8">
            <Gift className="h-12 w-12" style={{ color: '#00ff88', filter: 'drop-shadow(0 0 10px rgba(0, 255, 136, 0.5))' }} />
            <p className="text-glow-emerald mt-4 text-5xl font-bold" style={{ color: '#00ff88' }}>
              {customer.availableRewards?.length ?? 0}
            </p>
            <p className="mt-2 text-xl font-light" style={{ color: '#4a5568' }}>Available Rewards</p>
          </div>
        </div>

        <button
          onClick={() => setActionMode(null)}
          className="btn-futuristic-ghost touch-target mx-auto mt-6 w-full max-w-md text-2xl font-semibold"
        >
          <ArrowLeft className="mr-2 inline h-6 w-6" />
          Back
        </button>
      </div>
    );
  }

  // Add points numpad view
  if (actionMode === 'add-points') {
    return (
      <div className="flex h-full w-full items-center justify-center px-8 pb-8">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <h2 className="text-glow-emerald text-3xl font-bold" style={{ color: '#e8edf4' }}>Add Points</h2>
            <p className="mt-1 text-lg font-light" style={{ color: '#4a5568' }}>for {customer.name}</p>
          </div>

          <div className="holo-card p-6">
            <Numpad
              value={amountValue}
              onChange={setAmountValue}
              onSubmit={handleAddPoints}
              maxLength={6}
              placeholder="0"
              label="Enter point amount"
            />
          </div>

          <button
            onClick={() => {
              setActionMode(null);
              setAmountValue('');
            }}
            className="btn-futuristic-ghost touch-target mt-4 w-full text-xl font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Redeem reward view
  if (actionMode === 'redeem') {
    const rewards = customer.availableRewards || [];

    return (
      <div className="flex h-full w-full flex-col px-8 pb-8">
        <div className="mb-6 text-center">
          <h2 className="text-glow-emerald text-3xl font-bold" style={{ color: '#e8edf4' }}>Redeem Reward</h2>
          <p className="mt-1 text-lg font-light" style={{ color: '#4a5568' }}>
            {customer.name} -- {customer.points.toLocaleString()} pts available
          </p>
        </div>

        <div className="mx-auto grid w-full max-w-4xl flex-1 grid-cols-2 gap-4 overflow-y-auto">
          {rewards.length === 0 ? (
            <div className="col-span-2 flex items-center justify-center">
              <p className="text-2xl font-light" style={{ color: '#4a5568' }}>No rewards available</p>
            </div>
          ) : (
            rewards.map((reward) => (
              <button
                key={reward.id}
                onClick={() => handleRedeemReward(reward.id, reward.name)}
                disabled={customer.points < reward.pointsCost || processing}
                className="touch-target holo-card flex-col px-6 text-left
                  transition-all active:scale-95
                  disabled:cursor-not-allowed disabled:opacity-40"
                style={{ borderColor: 'rgba(0, 255, 136, 0.2)' }}
              >
                <Gift className="mb-2 h-8 w-8" style={{ color: '#00ff88', filter: 'drop-shadow(0 0 8px rgba(0, 255, 136, 0.4))' }} />
                <p className="text-xl font-semibold" style={{ color: '#e8edf4' }}>{reward.name}</p>
                <p className="text-glow-cyan mt-1 text-lg font-medium" style={{ color: '#00d4ff' }}>
                  {reward.pointsCost.toLocaleString()} pts
                </p>
              </button>
            ))
          )}
        </div>

        <button
          onClick={() => setActionMode(null)}
          className="btn-futuristic-ghost touch-target mx-auto mt-4 w-full max-w-md text-xl font-semibold"
        >
          Cancel
        </button>
      </div>
    );
  }

  // Default: Customer overview with action buttons
  const ts = tierStyles[customer.tier] || defaultTierStyle;

  return (
    <div className="flex h-full w-full flex-col px-8 pb-8">
      {/* Customer info header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className="neon-pulse flex h-20 w-20 items-center justify-center rounded-full text-3xl font-bold"
            style={{
              background: 'rgba(0, 212, 255, 0.1)',
              border: '2px solid rgba(0, 212, 255, 0.3)',
              color: '#00d4ff',
              textShadow: '0 0 10px rgba(0, 212, 255, 0.5)',
            }}
          >
            {customer.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div>
            <h2 className="text-glow-white text-3xl font-bold" style={{ color: '#e8edf4' }}>{customer.name}</h2>
            <div className="mt-1 flex items-center gap-3">
              <span
                className="rounded-full px-4 py-1 text-sm font-semibold"
                style={{
                  background: ts.bg,
                  border: `1px solid ${ts.border}`,
                  color: ts.text,
                  boxShadow: ts.glow,
                }}
              >
                {customer.tier}
              </span>
              {isOffline && (
                <span
                  className="rounded-full px-3 py-1 text-sm font-medium"
                  style={{
                    background: 'rgba(255, 77, 106, 0.1)',
                    border: '1px solid rgba(255, 77, 106, 0.3)',
                    color: '#ff4d6a',
                  }}
                >
                  Cached Data
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Points display */}
        <div className="text-right">
          <p className="text-glow-cyan text-5xl font-bold" style={{ color: '#00d4ff' }}>
            {customer.points.toLocaleString()}
          </p>
          <p className="text-xl font-light" style={{ color: '#4a5568' }}>points</p>
        </div>
      </div>

      {/* Action buttons - 4 large touch targets */}
      <div className="grid flex-1 grid-cols-4 gap-6">
        <button
          onClick={() => setActionMode('add-points')}
          disabled={processing}
          className="touch-target flex-col rounded-2xl transition-all active:scale-95 disabled:opacity-50"
          style={{
            background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.1) 0%, rgba(0, 255, 136, 0.04) 100%)',
            border: '1px solid rgba(0, 255, 136, 0.2)',
            boxShadow: '0 0 20px rgba(0, 255, 136, 0.06), inset 0 1px 0 rgba(0, 255, 136, 0.1)',
          }}
        >
          <Plus className="mb-3 h-14 w-14" style={{ color: '#00ff88', filter: 'drop-shadow(0 0 10px rgba(0, 255, 136, 0.5))' }} />
          <span className="text-2xl font-semibold" style={{ color: '#e8edf4' }}>Add Points</span>
        </button>

        <button
          onClick={() => setActionMode('redeem')}
          disabled={processing}
          className="touch-target flex-col rounded-2xl transition-all active:scale-95 disabled:opacity-50"
          style={{
            background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(0, 212, 255, 0.04) 100%)',
            border: '1px solid rgba(0, 212, 255, 0.2)',
            boxShadow: '0 0 20px rgba(0, 212, 255, 0.06), inset 0 1px 0 rgba(0, 212, 255, 0.1)',
          }}
        >
          <Gift className="mb-3 h-14 w-14" style={{ color: '#00d4ff', filter: 'drop-shadow(0 0 10px rgba(0, 212, 255, 0.5))' }} />
          <span className="text-2xl font-semibold" style={{ color: '#e8edf4' }}>Redeem Reward</span>
        </button>

        <button
          onClick={handleAddStamp}
          disabled={processing}
          className="touch-target flex-col rounded-2xl transition-all active:scale-95 disabled:opacity-50"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 165, 0, 0.1) 0%, rgba(255, 165, 0, 0.04) 100%)',
            border: '1px solid rgba(255, 165, 0, 0.2)',
            boxShadow: '0 0 20px rgba(255, 165, 0, 0.06), inset 0 1px 0 rgba(255, 165, 0, 0.1)',
          }}
        >
          <Stamp className="mb-3 h-14 w-14" style={{ color: '#ffa500', filter: 'drop-shadow(0 0 10px rgba(255, 165, 0, 0.5))' }} />
          <span className="text-2xl font-semibold" style={{ color: '#e8edf4' }}>Add Stamp</span>
          <span className="mt-1 text-lg font-light" style={{ color: '#4a5568' }}>
            {customer.stamps}/{customer.totalStamps}
          </span>
        </button>

        <button
          onClick={() => setActionMode('balance')}
          disabled={processing}
          className="touch-target flex-col rounded-2xl transition-all active:scale-95 disabled:opacity-50"
          style={{
            background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.08) 0%, rgba(0, 255, 136, 0.04) 100%)',
            border: '1px solid rgba(0, 212, 255, 0.15)',
            boxShadow: '0 0 20px rgba(0, 212, 255, 0.05), inset 0 1px 0 rgba(0, 212, 255, 0.08)',
          }}
        >
          <Wallet className="mb-3 h-14 w-14" style={{ color: '#00d4ff', filter: 'drop-shadow(0 0 10px rgba(0, 212, 255, 0.5))' }} />
          <span className="text-2xl font-semibold" style={{ color: '#e8edf4' }}>Check Balance</span>
        </button>
      </div>

      {/* Bottom navigation */}
      <div className="mt-6 flex items-center justify-center gap-6">
        <button
          onClick={() => router.push('/kiosk')}
          className="btn-futuristic-ghost touch-target px-10 text-xl font-semibold"
        >
          <ArrowLeft className="mr-2 inline h-6 w-6" />
          Back
        </button>
      </div>
    </div>
  );
}
