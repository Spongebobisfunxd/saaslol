'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Progress } from '@loyalty/ui';
import { Check, Gift, Sparkles } from 'lucide-react';
import { cn } from '@loyalty/ui';
import { useAuthStore } from '@loyalty/store';
import { useStampCards, useStampDefinitions } from '@loyalty/api-client';

// ---------- Types ----------
interface StampCardDisplay {
  id: string;
  name: string;
  emoji: string;
  totalStamps: number;
  currentStamps: number;
  rewardName: string;
  completed: boolean;
  rewardClaimed: boolean;
}

// ---------- Stamp circle component ----------
function StampCircle({
  filled,
  index,
  isLast,
  isReward,
}: {
  filled: boolean;
  index: number;
  isLast: boolean;
  isReward: boolean;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full border-2 transition-all duration-300',
        isReward ? 'w-12 h-12' : 'w-11 h-11',
        filled && 'animate-in zoom-in-50 duration-300',
      )}
      style={{
        ...(filled
          ? {
              background: 'linear-gradient(135deg, #c4653a, #8b4528)',
              borderColor: '#c4653a',
              color: '#faf7f2',
              boxShadow: '0 2px 8px rgba(196, 101, 58, 0.3)',
            }
          : {
              borderStyle: 'dashed',
              borderColor: 'rgba(168, 146, 138, 0.35)',
              background: 'rgba(253, 240, 231, 0.5)',
              color: 'rgba(168, 146, 138, 0.5)',
            }),
        animationDelay: `${index * 50}ms`,
      }}
    >
      {isReward && filled ? (
        <Gift className="h-5 w-5" />
      ) : filled ? (
        <Check className="h-5 w-5" />
      ) : isReward ? (
        <Gift className="h-4 w-4" />
      ) : (
        <span className="text-xs font-medium">{index + 1}</span>
      )}
    </div>
  );
}

// ---------- Default emoji for stamp definitions ----------
const DEFINITION_EMOJIS: Record<string, string> = {
  'kawa': '\u2615',
  'coffee': '\u2615',
  'lunch': '\uD83C\uDF7D\uFE0F',
  'deser': '\uD83C\uDF70',
  'dessert': '\uD83C\uDF70',
  'smoothie': '\uD83E\uDD64',
  'herbata': '\uD83C\uDF75',
  'tea': '\uD83C\uDF75',
};

function getDefinitionEmoji(name: string): string {
  const lower = name.toLowerCase();
  for (const [key, emoji] of Object.entries(DEFINITION_EMOJIS)) {
    if (lower.includes(key)) return emoji;
  }
  return '\uD83C\uDFAF';
}

export default function StampsPage() {
  const { user } = useAuthStore();
  const { data: stampCards, isLoading: isLoadingCards, error: cardsError } = useStampCards(user?.id);
  const { data: stampDefinitions, isLoading: isLoadingDefs } = useStampDefinitions();
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const isLoading = isLoadingCards || isLoadingDefs;

  // Build a lookup map from definitions
  const defsMap = new Map<string, { name: string; rewardDescription: string; stampsRequired: number }>();
  if (stampDefinitions) {
    // stampDefinitions may be an array or { data: [] }
    const defs = Array.isArray(stampDefinitions) ? stampDefinitions : (stampDefinitions as any).data ?? [];
    for (const def of defs) {
      defsMap.set(def.id, {
        name: def.name,
        rewardDescription: def.rewardDescription,
        stampsRequired: def.stampsRequired,
      });
    }
  }

  // Map API stamp cards to display format
  const cards: StampCardDisplay[] = (() => {
    if (!stampCards) return [];
    const rawCards = Array.isArray(stampCards) ? stampCards : (stampCards as any).data ?? [];
    return rawCards.map((card: any) => {
      const def = defsMap.get(card.definitionId);
      const name = def?.name || 'Karta stemplowa';
      return {
        id: card.id,
        name,
        emoji: getDefinitionEmoji(name),
        totalStamps: card.stampsRequired ?? def?.stampsRequired ?? 10,
        currentStamps: card.currentStamps ?? 0,
        rewardName: def?.rewardDescription || 'Nagroda',
        completed: card.isCompleted ?? false,
        rewardClaimed: !!(card.completedAt && card.isCompleted),
      };
    });
  })();

  const handleClaim = async (cardId: string) => {
    setClaimingId(cardId);
    // TODO: When a claim endpoint is available, wire it up here
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setClaimingId(null);
  };

  if (cardsError) {
    return (
      <div className="space-y-4">
        <div className="px-4 pt-12 pb-4" style={{ background: '#fdf0e7', borderBottom: '1px solid rgba(168, 146, 138, 0.15)' }}>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-outfit), system-ui, sans-serif', color: '#3d2c22' }}>
            Karty stemplowe
          </h1>
        </div>
        <div className="px-4 py-8 text-center">
          <p className="text-sm" style={{ color: '#c44a3a' }}>Nie udalo sie zaladowac kart stemplowych. Sprobuj ponownie pozniej.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="px-4 pt-12 pb-4" style={{ background: '#fdf0e7', borderBottom: '1px solid rgba(168, 146, 138, 0.15)' }}>
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-outfit), system-ui, sans-serif', color: '#3d2c22' }}>
          Karty stemplowe
        </h1>
        <p className="text-sm mt-1" style={{ color: '#a8928a' }}>
          Zbieraj stemple i odbieraj nagrody
        </p>
      </div>

      {/* Stamp cards list */}
      <div className="space-y-4 px-4 pb-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="border-0 shadow-md overflow-hidden rounded-2xl" style={{ background: '#fdf0e7' }}>
              <CardContent className="p-5 space-y-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full" style={{ background: 'rgba(168, 146, 138, 0.2)' }} />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-32 rounded" style={{ background: 'rgba(168, 146, 138, 0.2)' }} />
                    <div className="h-3 w-24 rounded" style={{ background: 'rgba(168, 146, 138, 0.2)' }} />
                  </div>
                </div>
                <div className="h-2 w-full rounded" style={{ background: 'rgba(168, 146, 138, 0.2)' }} />
                <div className="flex flex-wrap gap-2 justify-center py-2">
                  {Array.from({ length: 8 }).map((_, j) => (
                    <div key={j} className="h-11 w-11 rounded-full" style={{ background: 'rgba(168, 146, 138, 0.15)' }} />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        ) : cards.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm" style={{ color: '#a8928a' }}>Nie masz jeszcze zadnych kart stemplowych</p>
          </div>
        ) : (
          cards.map((card) => {
            const progress = (card.currentStamps / card.totalStamps) * 100;

            return (
              <Card
                key={card.id}
                className={cn(
                  'border-0 shadow-md overflow-hidden rounded-2xl',
                )}
                style={{
                  background: '#fdf0e7',
                  ...(card.completed && !card.rewardClaimed
                    ? { boxShadow: '0 0 0 2px #c4653a, 0 4px 12px rgba(196, 101, 58, 0.15)' }
                    : {}),
                }}
              >
                <CardContent className="p-5 space-y-4">
                  {/* Card header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{card.emoji}</span>
                      <div>
                        <h3 className="text-base font-bold" style={{ fontFamily: 'var(--font-outfit), system-ui, sans-serif', color: '#3d2c22' }}>
                          {card.name}
                        </h3>
                        <p className="text-xs" style={{ color: '#a8928a' }}>
                          Nagroda: {card.rewardName}
                        </p>
                      </div>
                    </div>
                    {card.completed && !card.rewardClaimed && (
                      <Badge
                        className="border-0 text-xs rounded-full px-3"
                        style={{ background: 'rgba(107, 143, 107, 0.15)', color: '#6b8f6b' }}
                      >
                        <Sparkles className="h-3 w-3 mr-1" />
                        Gotowe!
                      </Badge>
                    )}
                    {card.rewardClaimed && (
                      <Badge
                        variant="secondary"
                        className="text-xs rounded-full"
                        style={{ background: 'rgba(168, 146, 138, 0.15)', color: '#a8928a' }}
                      >
                        Odebrane
                      </Badge>
                    )}
                  </div>

                  {/* Progress indicator */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span style={{ color: '#a8928a' }}>Postep</span>
                      <span className="font-semibold" style={{ color: '#3d2c22' }}>
                        {card.currentStamps} / {card.totalStamps}
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  {/* Stamp grid */}
                  <div className="flex flex-wrap gap-2 justify-center py-2">
                    {Array.from({ length: card.totalStamps }).map((_, idx) => (
                      <StampCircle
                        key={idx}
                        filled={idx < card.currentStamps}
                        index={idx}
                        isLast={idx === card.totalStamps - 1}
                        isReward={idx === card.totalStamps - 1}
                      />
                    ))}
                  </div>

                  {/* Claim button for completed cards */}
                  {card.completed && !card.rewardClaimed && (
                    <Button
                      onClick={() => handleClaim(card.id)}
                      disabled={claimingId === card.id}
                      className="w-full h-14 text-lg font-semibold rounded-2xl border-0 text-white"
                      size="lg"
                      style={{ background: 'linear-gradient(135deg, #c4653a, #8b4528)' }}
                    >
                      {claimingId === card.id ? (
                        'Odbieranie nagrody...'
                      ) : (
                        <>
                          <Gift className="h-5 w-5 mr-2" />
                          Odbierz nagrode
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
