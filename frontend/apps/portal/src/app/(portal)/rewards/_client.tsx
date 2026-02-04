'use client';

import { useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  Button,
  Badge,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@loyalty/ui';
import { useAuthStore } from '@loyalty/store';
import { useRewards, useRedeemReward, useCustomer } from '@loyalty/api-client';
import { Gift, Check, Filter, ChevronDown } from 'lucide-react';

// ---------- Types ----------
interface RewardDisplay {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  category: string;
  emoji: string;
}

const CATEGORIES = ['Wszystkie', 'Napoje', 'Jedzenie', 'Znizki', 'Vouchery', 'Specjalne'];

// ---------- Emoji fallback ----------
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

export default function RewardsPage() {
  const { user } = useAuthStore();
  const { data: rewardsData, isLoading: isLoadingRewards, error: rewardsError } = useRewards({ limit: 50, status: 'active' });
  const { data: customerData, isLoading: isLoadingCustomer } = useCustomer(user?.id ?? '');
  const redeemMutation = useRedeemReward();

  const [selectedCategory, setSelectedCategory] = useState('Wszystkie');
  const [redeemReward, setRedeemReward] = useState<RewardDisplay | null>(null);
  const [redeemed, setRedeemed] = useState(false);

  const customerPoints = customerData?.points ?? 0;

  // Map API rewards to display format
  const allRewards: RewardDisplay[] = (rewardsData?.data ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description || '',
    pointsCost: r.pointsCost,
    category: r.category || 'Inne',
    emoji: getRewardEmoji(r.category),
  }));

  const filteredRewards =
    selectedCategory === 'Wszystkie'
      ? allRewards
      : allRewards.filter((r) => r.category === selectedCategory);

  const handleRedeem = useCallback(async () => {
    if (!redeemReward || !user?.id) return;

    try {
      await redeemMutation.mutateAsync({
        rewardId: redeemReward.id,
        customerId: user.id,
      });
      setRedeemed(true);
    } catch (err: any) {
      // Keep dialog open with error feedback - user can retry
    }
  }, [redeemReward, user?.id, redeemMutation]);

  const closeDialog = () => {
    setRedeemReward(null);
    setRedeemed(false);
  };

  if (rewardsError) {
    return (
      <div className="space-y-4">
        <div className="px-4 pt-12 pb-4" style={{ background: '#fdf0e7', borderBottom: '1px solid rgba(168, 146, 138, 0.15)' }}>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-outfit), system-ui, sans-serif', color: '#3d2c22' }}>
            Nagrody
          </h1>
        </div>
        <div className="px-4 py-8 text-center">
          <p className="text-sm" style={{ color: '#c44a3a' }}>Nie udalo sie zaladowac nagrod. Sprobuj ponownie pozniej.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="px-4 pt-12 pb-4" style={{ background: '#fdf0e7', borderBottom: '1px solid rgba(168, 146, 138, 0.15)' }}>
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-outfit), system-ui, sans-serif', color: '#3d2c22' }}>
          Nagrody
        </h1>
        <p className="text-sm mt-1" style={{ color: '#a8928a' }}>
          {isLoadingCustomer ? (
            <span className="inline-block h-4 w-24 rounded animate-pulse" style={{ background: 'rgba(168, 146, 138, 0.2)' }} />
          ) : (
            <>
              Masz <span className="font-bold" style={{ color: '#c4653a' }}>{customerPoints.toLocaleString('pl-PL')}</span> punktow
            </>
          )}
        </p>
      </div>

      {/* Category filter - horizontal scroll */}
      <div className="flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className="shrink-0 rounded-full px-4 py-2 text-sm font-medium min-h-[40px] transition-all"
            style={{
              background: selectedCategory === cat
                ? 'linear-gradient(135deg, #c4653a, #8b4528)'
                : '#fdf0e7',
              color: selectedCategory === cat ? '#faf7f2' : '#a8928a',
              border: selectedCategory === cat ? 'none' : '1px solid rgba(168, 146, 138, 0.2)',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Rewards grid */}
      <div className="grid grid-cols-2 gap-3 px-4 pb-4">
        {isLoadingRewards ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="border-0 shadow-md overflow-hidden rounded-2xl" style={{ background: '#fdf0e7' }}>
              <CardContent className="p-4 flex flex-col items-center text-center h-full animate-pulse">
                <div className="h-10 w-10 mb-3 mt-1 rounded-full" style={{ background: 'rgba(168, 146, 138, 0.2)' }} />
                <div className="h-4 w-20 mb-1 rounded" style={{ background: 'rgba(168, 146, 138, 0.2)' }} />
                <div className="h-3 w-24 mb-3 rounded" style={{ background: 'rgba(168, 146, 138, 0.2)' }} />
                <div className="mt-auto w-full space-y-2">
                  <div className="h-3 w-14 mx-auto rounded" style={{ background: 'rgba(168, 146, 138, 0.2)' }} />
                  <div className="h-11 w-full rounded-xl" style={{ background: 'rgba(168, 146, 138, 0.2)' }} />
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredRewards.length === 0 ? (
          <div className="col-span-2 text-center py-8">
            <p className="text-sm" style={{ color: '#a8928a' }}>Brak nagrod w tej kategorii</p>
          </div>
        ) : (
          filteredRewards.map((reward) => {
            const canAfford = customerPoints >= reward.pointsCost;

            return (
              <Card
                key={reward.id}
                className="border-0 shadow-md overflow-hidden rounded-2xl"
                style={{ background: '#fdf0e7' }}
              >
                <CardContent className="p-4 flex flex-col items-center text-center h-full">
                  <div className="text-4xl mb-3 mt-1">{reward.emoji}</div>
                  <p className="text-sm font-bold leading-tight mb-1" style={{ color: '#3d2c22' }}>{reward.name}</p>
                  <p className="text-xs mb-3 line-clamp-2" style={{ color: '#a8928a' }}>
                    {reward.description}
                  </p>

                  <div className="mt-auto w-full space-y-2">
                    <div className="flex items-center justify-center gap-1">
                      <Gift className="h-3.5 w-3.5" style={{ color: '#c4653a' }} />
                      <span className="text-sm font-bold" style={{ color: '#c4653a' }}>
                        {reward.pointsCost} pkt
                      </span>
                    </div>

                    <Button
                      onClick={() => setRedeemReward(reward)}
                      disabled={!canAfford}
                      className="w-full h-11 rounded-xl text-sm font-semibold border-0 transition-all"
                      variant={canAfford ? 'default' : 'outline'}
                      size="sm"
                      style={
                        canAfford
                          ? { background: 'linear-gradient(135deg, #c4653a, #8b4528)', color: '#faf7f2' }
                          : { background: 'rgba(168, 146, 138, 0.1)', color: '#a8928a', border: '1px solid rgba(168, 146, 138, 0.2)' }
                      }
                    >
                      {canAfford ? 'Odbierz' : 'Za malo pkt'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Redemption confirmation dialog */}
      <Dialog open={!!redeemReward} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-sm mx-4 rounded-3xl border-0" style={{ background: '#fdf0e7' }}>
          {!redeemed ? (
            <>
              <DialogHeader className="text-center">
                <div className="text-6xl mx-auto mb-2">{redeemReward?.emoji}</div>
                <DialogTitle className="text-xl" style={{ fontFamily: 'var(--font-outfit), system-ui, sans-serif', color: '#3d2c22' }}>
                  Odbierz nagrode?
                </DialogTitle>
                <DialogDescription className="text-base" style={{ color: '#a8928a' }}>
                  <span className="font-bold" style={{ color: '#3d2c22' }}>{redeemReward?.name}</span>
                  <br />
                  Kosztuje{' '}
                  <span className="font-bold" style={{ color: '#c4653a' }}>
                    {redeemReward?.pointsCost} punktow
                  </span>
                </DialogDescription>
              </DialogHeader>
              {redeemMutation.isError && (
                <p className="text-sm text-center" style={{ color: '#c44a3a' }}>
                  Nie udalo sie odbierac nagrody. Sprobuj ponownie.
                </p>
              )}
              <DialogFooter className="flex-col gap-2 sm:flex-col">
                <Button
                  onClick={handleRedeem}
                  disabled={redeemMutation.isPending}
                  className="w-full h-14 text-lg font-semibold rounded-2xl border-0 text-white"
                  style={{ background: 'linear-gradient(135deg, #c4653a, #8b4528)' }}
                >
                  {redeemMutation.isPending ? 'Realizacja...' : 'Potwierdz odbior'}
                </Button>
                <DialogClose asChild>
                  <Button
                    variant="ghost"
                    className="w-full h-12 text-base rounded-2xl"
                    style={{ color: '#a8928a' }}
                  >
                    Anuluj
                  </Button>
                </DialogClose>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader className="text-center">
                <div
                  className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full"
                  style={{ background: 'rgba(107, 143, 107, 0.15)' }}
                >
                  <Check className="h-8 w-8" style={{ color: '#6b8f6b' }} />
                </div>
                <DialogTitle className="text-xl" style={{ fontFamily: 'var(--font-outfit), system-ui, sans-serif', color: '#3d2c22' }}>
                  Nagroda odebrana!
                </DialogTitle>
                <DialogDescription className="text-base" style={{ color: '#a8928a' }}>
                  {redeemReward?.name} zostala pomyslnie zrealizowana.
                  Pokaz potwierdzenie przy kasie.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button
                    className="w-full h-14 text-lg font-semibold rounded-2xl border-0 text-white"
                    style={{ background: 'linear-gradient(135deg, #c4653a, #8b4528)' }}
                  >
                    Gotowe
                  </Button>
                </DialogClose>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
