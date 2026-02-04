'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@loyalty/store';
import { useRewards, useCustomer } from '@loyalty/api-client';
import { Card, CardContent, Badge, Progress, Button } from '@loyalty/ui';
import { QrCode, Plus, Gift, ChevronRight, Star, Trophy } from 'lucide-react';

// ---------- Animated counter ----------
function AnimatedCounter({ value, duration = 1200 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const startTime = useRef<number | null>(null);

  useEffect(() => {
    startTime.current = null;
    let raf: number;

    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const elapsed = timestamp - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));

      if (progress < 1) {
        raf = requestAnimationFrame(animate);
      }
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <span>{display.toLocaleString('pl-PL')}</span>;
}

// ---------- Tier helpers ----------
function getTierConfig(points: number) {
  if (points >= 5000) {
    return { current: 'Platynowy', next: null, nextTierAt: 5000, color: 'bg-purple-400' };
  }
  if (points >= 2000) {
    return { current: 'Zloty', next: 'Platynowy', nextTierAt: 5000, color: 'bg-yellow-500' };
  }
  if (points >= 500) {
    return { current: 'Srebrny', next: 'Zloty', nextTierAt: 2000, color: 'bg-gray-400' };
  }
  return { current: 'Brazowy', next: 'Srebrny', nextTierAt: 500, color: 'bg-orange-700' };
}

// ---------- Emoji fallback for rewards without images ----------
const CATEGORY_EMOJIS: Record<string, string> = {
  'Napoje': '\u2615',
  'Jedzenie': '\uD83C\uDF70',
  'Znizki': '\uD83C\uDFF7\uFE0F',
  'Vouchery': '\uD83D\uDCB3',
  'Specjalne': '\uD83D\uDC51',
};

function getRewardEmoji(category?: string): string {
  return (category && CATEGORY_EMOJIS[category]) || '\uD83C\uDF81';
}

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const { data: customerData, isLoading: isLoadingCustomer } = useCustomer(user?.id ?? '');
  const { data: rewardsData, isLoading: isLoadingRewards } = useRewards({ limit: 5, status: 'active' });

  const pointsBalance = customerData?.points ?? 0;
  const tierConfig = getTierConfig(pointsBalance);
  const tierProgress = tierConfig.next
    ? (pointsBalance / tierConfig.nextTierAt) * 100
    : 100;

  const rewards = rewardsData?.data ?? [];

  return (
    <div className="space-y-6">
      {/* Header with greeting */}
      <div
        className="relative px-5 pt-12 pb-10 text-white overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #c4653a 0%, #b5583a 50%, #8b4528 100%)' }}
      >
        {/* Organic blob decorations */}
        <div
          className="absolute top-[-20%] right-[-15%] w-[45%] h-[80%] opacity-10 pointer-events-none"
          style={{ borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%', background: 'white' }}
        />
        <div
          className="absolute bottom-[-30%] left-[-10%] w-[40%] h-[60%] opacity-5 pointer-events-none"
          style={{ borderRadius: '60% 40% 30% 70% / 50% 60% 40% 50%', background: 'white' }}
        />
        <p className="text-base opacity-90 relative z-10" style={{ fontFamily: 'var(--font-nunito), system-ui, sans-serif' }}>Czesc,</p>
        <h1 className="text-2xl font-bold relative z-10" style={{ fontFamily: 'var(--font-outfit), system-ui, sans-serif' }}>
          {user?.firstName || 'Kliencie'} {user?.lastName ? user.lastName.charAt(0) + '.' : ''}
        </h1>
      </div>

      {/* Points balance card - overlapping header */}
      <div className="px-4 -mt-8">
        <Card className="border-0 shadow-xl rounded-2xl overflow-hidden" style={{ background: '#fdf0e7' }}>
          <CardContent className="p-6 text-center">
            {isLoadingCustomer ? (
              <div className="animate-pulse space-y-2">
                <div className="h-4 w-24 mx-auto rounded" style={{ background: 'rgba(168, 146, 138, 0.2)' }} />
                <div className="h-12 w-32 mx-auto rounded" style={{ background: 'rgba(168, 146, 138, 0.2)' }} />
                <div className="h-4 w-16 mx-auto rounded" style={{ background: 'rgba(168, 146, 138, 0.2)' }} />
              </div>
            ) : (
              <>
                <p className="text-sm mb-1" style={{ color: '#a8928a' }}>Twoje punkty</p>
                <div className="text-5xl font-extrabold mb-2" style={{ fontFamily: 'var(--font-outfit), system-ui, sans-serif', color: '#c4653a' }}>
                  <AnimatedCounter value={pointsBalance} />
                </div>
                <p className="text-sm" style={{ color: '#a8928a' }}>punktow</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tier badge with progress */}
      <div className="px-4">
        <Card className="border-0 shadow-md rounded-2xl overflow-hidden" style={{ background: '#fdf0e7' }}>
          <CardContent className="p-5">
            {isLoadingCustomer ? (
              <div className="animate-pulse space-y-3">
                <div className="h-6 w-40 rounded" style={{ background: 'rgba(168, 146, 138, 0.2)' }} />
                <div className="h-3 w-full rounded" style={{ background: 'rgba(168, 146, 138, 0.2)' }} />
                <div className="h-4 w-48 rounded" style={{ background: 'rgba(168, 146, 138, 0.2)' }} />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-xl"
                      style={{ background: 'linear-gradient(135deg, rgba(196, 101, 58, 0.15), rgba(139, 69, 40, 0.1))' }}
                    >
                      <Trophy className="h-4.5 w-4.5" style={{ color: '#c4653a' }} />
                    </div>
                    <span className="text-base font-semibold" style={{ fontFamily: 'var(--font-outfit), system-ui, sans-serif', color: '#3d2c22' }}>
                      Poziom: {tierConfig.current}
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-xs rounded-full border-0 px-3 py-1"
                    style={{ background: 'rgba(196, 101, 58, 0.1)', color: '#8b4528' }}
                  >
                    {pointsBalance} / {tierConfig.nextTierAt} pkt
                  </Badge>
                </div>
                <Progress value={Math.min(tierProgress, 100)} className="h-3 rounded-full" />
                {tierConfig.next ? (
                  <p className="text-xs mt-2" style={{ color: '#a8928a' }}>
                    Jeszcze {tierConfig.nextTierAt - pointsBalance} pkt do poziomu {tierConfig.next}
                  </p>
                ) : (
                  <p className="text-xs mt-2" style={{ color: '#a8928a' }}>
                    Najwyzszy poziom osiagniety!
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="px-4">
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => router.push('/qr')}
            variant="outline"
            className="h-16 flex-col gap-1 rounded-2xl border-2 text-base font-semibold shadow-sm transition-all active:scale-[0.97]"
            style={{ background: '#fdf0e7', borderColor: 'rgba(196, 101, 58, 0.2)', color: '#3d2c22' }}
          >
            <QrCode className="h-6 w-6" style={{ color: '#c4653a' }} />
            Pokaz kod QR
          </Button>
          <Button
            onClick={() => router.push('/shakeomat')}
            variant="outline"
            className="h-16 flex-col gap-1 rounded-2xl border-2 text-base font-semibold shadow-sm transition-all active:scale-[0.97]"
            style={{ background: '#fdf0e7', borderColor: 'rgba(196, 101, 58, 0.2)', color: '#3d2c22' }}
          >
            <Star className="h-6 w-6" style={{ color: '#c4653a' }} />
            Shakeomat
          </Button>
        </div>
      </div>

      {/* Featured rewards carousel */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-4">
          <h2 className="text-lg font-bold" style={{ fontFamily: 'var(--font-outfit), system-ui, sans-serif', color: '#3d2c22' }}>
            Polecane nagrody
          </h2>
          <button
            onClick={() => router.push('/rewards')}
            className="flex items-center gap-1 text-sm font-medium min-h-[44px] px-2 transition-colors"
            style={{ color: '#c4653a' }}
          >
            Wszystkie <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide snap-x snap-mandatory">
          {isLoadingRewards ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card
                key={i}
                className="min-w-[160px] snap-start border-0 shadow-md rounded-2xl overflow-hidden"
                style={{ background: '#fdf0e7' }}
              >
                <CardContent className="p-4 text-center animate-pulse">
                  <div className="h-10 w-10 mx-auto mb-2 rounded-full" style={{ background: 'rgba(168, 146, 138, 0.2)' }} />
                  <div className="h-4 w-20 mx-auto mb-1 rounded" style={{ background: 'rgba(168, 146, 138, 0.2)' }} />
                  <div className="h-3 w-14 mx-auto rounded" style={{ background: 'rgba(168, 146, 138, 0.2)' }} />
                </CardContent>
              </Card>
            ))
          ) : rewards.length > 0 ? (
            rewards.map((reward) => (
              <Card
                key={reward.id}
                className="min-w-[160px] snap-start border-0 shadow-md cursor-pointer active:scale-[0.97] transition-all rounded-2xl overflow-hidden"
                onClick={() => router.push('/rewards')}
                style={{ background: '#fdf0e7' }}
              >
                <CardContent className="p-4 text-center">
                  <div className="text-4xl mb-2">{getRewardEmoji(reward.category)}</div>
                  <p className="text-sm font-semibold leading-tight mb-1" style={{ color: '#3d2c22' }}>{reward.name}</p>
                  <div className="flex items-center justify-center gap-1">
                    <Gift className="h-3.5 w-3.5" style={{ color: '#c4653a' }} />
                    <span className="text-sm font-bold" style={{ color: '#c4653a' }}>{reward.pointsCost} pkt</span>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-sm px-2" style={{ color: '#a8928a' }}>Brak dostepnych nagrod</p>
          )}
        </div>
      </div>

      {/* Earn points CTA */}
      <div className="px-4 pb-4">
        <Card
          className="border-0 text-white shadow-lg rounded-2xl overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #c4653a 0%, #8b4528 100%)' }}
        >
          <CardContent className="p-5 relative overflow-hidden">
            {/* Organic decoration */}
            <div
              className="absolute top-[-20%] right-[-10%] w-[40%] h-[120%] opacity-10 pointer-events-none"
              style={{ borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%', background: 'white' }}
            />
            <div className="flex items-center justify-between relative z-10">
              <div className="space-y-1">
                <p className="text-base font-bold" style={{ fontFamily: 'var(--font-outfit), system-ui, sans-serif' }}>Zdobywaj punkty</p>
                <p className="text-sm opacity-90">
                  Pokaz kod QR przy kasie, aby zbierac punkty za zakupy.
                </p>
              </div>
              <Button
                onClick={() => router.push('/qr')}
                variant="secondary"
                size="lg"
                className="h-12 w-12 rounded-full p-0 shrink-0 shadow-md"
                style={{ background: '#fdf0e7', color: '#c4653a' }}
              >
                <Plus className="h-6 w-6" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
