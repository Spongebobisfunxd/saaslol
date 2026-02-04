'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, Button } from '@loyalty/ui';
import { cn } from '@loyalty/ui';
import { Smartphone, Gift, ArrowLeft, RotateCcw, Sparkles } from 'lucide-react';
import { useAuthStore } from '@loyalty/store';
import { useRewards, useRedeemReward } from '@loyalty/api-client';

// ---------- Types ----------
type ShakeState = 'idle' | 'shaking' | 'animating' | 'revealed';

interface ShakeReward {
  id?: string;
  name: string;
  emoji: string;
  pointsCost?: number;
  description: string;
}

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

// ---------- Fallback rewards (used when API data is not yet loaded) ----------
const FALLBACK_REWARDS: ShakeReward[] = [
  { name: 'Darmowa kawa', emoji: '\u2615', description: 'Odbierz przy nastepnej wizycie!' },
  { name: '50 bonusowych punktow', emoji: '\uD83C\uDFAF', description: 'Punkty zostaly dodane do Twojego konta.' },
  { name: 'Znizka 15%', emoji: '\uD83C\uDFF7\uFE0F', description: 'Na dowolne zamowienie. Wazna 7 dni.' },
  { name: 'Darmowy deser', emoji: '\uD83C\uDF70', description: 'Wybierz dowolny deser z menu!' },
];

// ---------- Shake detection hook ----------
function useShakeDetection(onShake: () => void, enabled: boolean) {
  const lastAcceleration = useRef({ x: 0, y: 0, z: 0 });
  const shakeThreshold = 15;
  const shakeCount = useRef(0);
  const lastShakeTime = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    const handleMotion = (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity;
      if (!acc || acc.x === null || acc.y === null || acc.z === null) return;

      const deltaX = Math.abs(acc.x - lastAcceleration.current.x);
      const deltaY = Math.abs(acc.y - lastAcceleration.current.y);
      const deltaZ = Math.abs(acc.z - lastAcceleration.current.z);

      lastAcceleration.current = { x: acc.x, y: acc.y, z: acc.z };

      if (deltaX + deltaY + deltaZ > shakeThreshold) {
        const now = Date.now();
        if (now - lastShakeTime.current > 300) {
          shakeCount.current += 1;
          lastShakeTime.current = now;

          if (shakeCount.current >= 3) {
            shakeCount.current = 0;
            onShake();
          }
        }
      }
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [onShake, enabled]);
}

// ---------- Page ----------
export default function ShakeomatPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { data: rewardsData } = useRewards({ limit: 50, status: 'active' });
  const redeemMutation = useRedeemReward();

  const [state, setState] = useState<ShakeState>('idle');
  const [reward, setReward] = useState<ShakeReward | null>(null);
  const [shakeAngle, setShakeAngle] = useState(0);

  // Build reward pool from API data
  const rewardPool: ShakeReward[] = (() => {
    const apiRewards = rewardsData?.data ?? [];
    if (apiRewards.length === 0) return FALLBACK_REWARDS;
    return apiRewards.map((r) => ({
      id: r.id,
      name: r.name,
      emoji: getRewardEmoji(r.category),
      pointsCost: r.pointsCost,
      description: r.description || 'Odbierz przy nastepnej wizycie!',
    }));
  })();

  const handleShake = useCallback(() => {
    if (state !== 'idle') return;
    triggerReward();
  }, [state]);

  useShakeDetection(handleShake, state === 'idle');

  // Idle phone wobble animation
  useEffect(() => {
    if (state !== 'idle') return;

    let raf: number;
    let start: number;

    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const angle = Math.sin(elapsed / 300) * 5;
      setShakeAngle(angle);
      raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [state]);

  const triggerReward = async () => {
    setState('shaking');

    // Shake animation
    let shakeFrames = 0;
    const shakeInterval = setInterval(() => {
      setShakeAngle(Math.sin(shakeFrames * 0.8) * 20);
      shakeFrames++;
      if (shakeFrames > 20) {
        clearInterval(shakeInterval);
        setShakeAngle(0);
      }
    }, 50);

    // Wait for shake animation
    await new Promise((resolve) => setTimeout(resolve, 1200));

    setState('animating');

    // Pick random reward
    const randomReward =
      rewardPool[Math.floor(Math.random() * rewardPool.length)];
    setReward(randomReward);

    // Optionally redeem if it has an ID and a cost
    if (randomReward.id && user?.id) {
      try {
        await redeemMutation.mutateAsync({
          rewardId: randomReward.id,
          customerId: user.id,
        });
      } catch {
        // Silently fail - the reward reveal still shows
      }
    }

    // Brief pause before reveal
    await new Promise((resolve) => setTimeout(resolve, 800));

    setState('revealed');
  };

  const handleTryAgain = () => {
    setState('idle');
    setReward(null);
    setShakeAngle(0);
  };

  // Fallback button for desktop / permission denied
  const handleManualShake = () => {
    if (state === 'idle') {
      triggerReward();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col text-white overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #c4653a 0%, #a8502e 30%, #8b4528 60%, #6b8f6b 100%)' }}
    >
      {/* Organic background decorations */}
      <div
        className="absolute top-[-10%] right-[-15%] w-[50%] h-[40%] opacity-10 pointer-events-none"
        style={{ borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%', background: 'white' }}
      />
      <div
        className="absolute bottom-[10%] left-[-10%] w-[40%] h-[35%] opacity-8 pointer-events-none"
        style={{ borderRadius: '60% 40% 30% 70% / 50% 60% 40% 50%', background: 'white', opacity: 0.08 }}
      />

      {/* Back button */}
      <div className="flex items-center justify-between p-4 pt-12 relative z-10">
        <Button
          onClick={() => router.back()}
          variant="ghost"
          className="h-12 text-white hover:bg-white/20 rounded-2xl"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Wroc
        </Button>
        <Sparkles className="h-6 w-6" style={{ color: '#fdf0e7' }} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 -mt-12 relative z-10">
        {(state === 'idle' || state === 'shaking') && (
          <>
            {/* Phone icon with shake animation */}
            <div
              className={cn(
                'mb-8 transition-transform',
                state === 'shaking' && 'animate-bounce',
              )}
              style={{ transform: `rotate(${shakeAngle}deg)` }}
            >
              <div
                className="flex h-32 w-32 items-center justify-center backdrop-blur-sm"
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
                }}
              >
                <Smartphone className="h-16 w-16" />
              </div>
            </div>

            <h1
              className="text-3xl font-extrabold text-center mb-3"
              style={{ fontFamily: 'var(--font-outfit), system-ui, sans-serif' }}
            >
              {state === 'shaking' ? 'Losowanie...' : 'Potrzasnij telefonem!'}
            </h1>

            <p className="text-base text-white/80 text-center max-w-xs mb-8">
              {state === 'shaking'
                ? 'Czekaj na wynik...'
                : 'Potrzasnij telefonem, aby wylosowac nagrode. Mozesz tez kliknac przycisk ponizej.'}
            </p>

            {/* Fallback button for desktop */}
            <Button
              onClick={handleManualShake}
              disabled={state === 'shaking'}
              variant="secondary"
              className="h-16 px-10 text-lg font-bold rounded-2xl shadow-lg border-0"
              size="lg"
              style={{ background: '#fdf0e7', color: '#c4653a' }}
            >
              {state === 'shaking' ? (
                <span className="animate-pulse">Losowanie...</span>
              ) : (
                <>
                  <Gift className="h-6 w-6 mr-2" />
                  Losuj nagrode
                </>
              )}
            </Button>
          </>
        )}

        {state === 'animating' && (
          <div className="flex flex-col items-center">
            <div className="relative">
              <div
                className="h-24 w-24 animate-spin rounded-full border-4"
                style={{ borderColor: 'rgba(255, 255, 255, 0.2)', borderTopColor: 'white' }}
              />
              <Gift className="absolute inset-0 m-auto h-10 w-10 animate-pulse" />
            </div>
            <p className="mt-6 text-xl font-bold animate-pulse" style={{ fontFamily: 'var(--font-outfit), system-ui, sans-serif' }}>
              Losowanie nagrody...
            </p>
          </div>
        )}

        {state === 'revealed' && reward && (
          <div className="w-full max-w-sm animate-in zoom-in-75 duration-500">
            <Card className="border-0 shadow-2xl overflow-hidden rounded-3xl" style={{ background: '#fdf0e7' }}>
              <CardContent className="p-8 text-center relative overflow-hidden">
                {/* Reward emoji */}
                <div className="text-7xl mb-4 animate-bounce">
                  {reward.emoji}
                </div>

                {/* Confetti dots */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-2 h-2 rounded-full animate-ping"
                      style={{
                        backgroundColor: ['#c4653a', '#8b4528', '#6b8f6b', '#a88832', '#a8928a'][i % 5],
                        left: `${10 + (i * 7)}%`,
                        top: `${10 + (i * 5)}%`,
                        animationDelay: `${i * 100}ms`,
                        animationDuration: '1.5s',
                      }}
                    />
                  ))}
                </div>

                <h2
                  className="text-2xl font-extrabold mb-2"
                  style={{ fontFamily: 'var(--font-outfit), system-ui, sans-serif', color: '#3d2c22' }}
                >
                  Gratulacje!
                </h2>
                <p className="text-xl font-bold mb-2" style={{ color: '#c4653a' }}>
                  {reward.name}
                </p>
                <p className="text-sm mb-6" style={{ color: '#a8928a' }}>
                  {reward.description}
                </p>

                <div className="space-y-3">
                  <Button
                    onClick={() => router.push('/home')}
                    className="w-full h-14 text-lg font-semibold rounded-2xl border-0 text-white"
                    size="lg"
                    style={{ background: 'linear-gradient(135deg, #c4653a, #8b4528)' }}
                  >
                    Swietnie!
                  </Button>

                  <Button
                    onClick={handleTryAgain}
                    variant="outline"
                    className="w-full h-12 text-base rounded-2xl"
                    style={{ borderColor: 'rgba(196, 101, 58, 0.3)', color: '#c4653a' }}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Sprobuj ponownie
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Bottom hint */}
      {state === 'idle' && (
        <div className="pb-8 text-center relative z-10">
          <p className="text-sm text-white/50">
            Dostepne raz dziennie
          </p>
        </div>
      )}
    </div>
  );
}
