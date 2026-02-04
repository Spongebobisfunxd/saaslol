'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@loyalty/store';
import { Button } from '@loyalty/ui';
import { X, Sun, CreditCard } from 'lucide-react';

/**
 * QR Code component using a canvas-based SVG pattern.
 * In production, use `qrcode.react` package for real QR generation.
 */
function QRCodeDisplay({ value, size = 240 }: { value: string; size?: number }) {
  // Simple deterministic grid pattern based on value hash
  const hash = value.split('').reduce((acc, char) => {
    return ((acc << 5) - acc + char.charCodeAt(0)) | 0;
  }, 0);

  const gridSize = 21;
  const cellSize = size / gridSize;

  const cells: boolean[][] = [];
  for (let row = 0; row < gridSize; row++) {
    cells[row] = [];
    for (let col = 0; col < gridSize; col++) {
      // Finder patterns (top-left, top-right, bottom-left)
      const isFinder =
        (row < 7 && col < 7) ||
        (row < 7 && col >= gridSize - 7) ||
        (row >= gridSize - 7 && col < 7);

      if (isFinder) {
        // Outer border
        const isOuterBorder =
          row === 0 || row === 6 || col === 0 || col === 6 ||
          row === gridSize - 7 || row === gridSize - 1 ||
          (col === gridSize - 7) || (col === gridSize - 1);

        // Inner fill
        const rLocal =
          row < 7 ? row : row >= gridSize - 7 ? row - (gridSize - 7) : row;
        const cLocal =
          col < 7 ? col : col >= gridSize - 7 ? col - (gridSize - 7) : col;

        const isCenter = rLocal >= 2 && rLocal <= 4 && cLocal >= 2 && cLocal <= 4;
        const isBorder = rLocal === 0 || rLocal === 6 || cLocal === 0 || cLocal === 6;

        cells[row][col] = isBorder || isCenter;
      } else {
        // Data area: deterministic from hash
        const seed = (hash * (row + 1) * (col + 1)) & 0xffff;
        cells[row][col] = seed % 3 !== 0;
      }
    }
  }

  return (
    <div
      className="p-4 rounded-3xl"
      style={{
        width: size + 32,
        height: size + 32,
        background: 'white',
        boxShadow: 'inset 0 2px 8px rgba(61, 44, 34, 0.06)',
      }}
    >
      <svg
        viewBox={`0 0 ${gridSize} ${gridSize}`}
        width={size}
        height={size}
        className="block"
      >
        {cells.map((row, r) =>
          row.map((filled, c) =>
            filled ? (
              <rect
                key={`${r}-${c}`}
                x={c}
                y={r}
                width={1}
                height={1}
                rx={0.15}
                fill="#3d2c22"
              />
            ) : null,
          ),
        )}
      </svg>
    </div>
  );
}

export default function QRPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  // Boost screen brightness hint
  useEffect(() => {
    // On supported devices, we could request wake lock
    let wakeLock: WakeLockSentinel | null = null;

    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await navigator.wakeLock.request('screen');
        }
      } catch {
        // Wake lock not supported or denied
      }
    };

    requestWakeLock();

    return () => {
      wakeLock?.release();
    };
  }, []);

  const customerId = user?.id || 'customer-unknown';
  const displayName = user
    ? `${user.firstName} ${user.lastName}`
    : 'Klient';

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6 overflow-hidden"
      style={{ background: '#faf7f2' }}
    >
      {/* Organic background decoration */}
      <div
        className="absolute top-[-15%] right-[-10%] w-[50%] h-[40%] pointer-events-none"
        style={{
          borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%',
          background: 'radial-gradient(ellipse at center, rgba(196, 101, 58, 0.06) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute bottom-[-10%] left-[-10%] w-[45%] h-[35%] pointer-events-none"
        style={{
          borderRadius: '60% 40% 30% 70% / 50% 60% 40% 50%',
          background: 'radial-gradient(ellipse at center, rgba(107, 143, 107, 0.05) 0%, transparent 70%)',
        }}
      />

      {/* Close button */}
      <Button
        onClick={() => router.back()}
        variant="ghost"
        size="lg"
        className="absolute top-4 right-4 h-12 w-12 rounded-full p-0"
        style={{ color: '#3d2c22' }}
      >
        <X className="h-6 w-6" />
      </Button>

      {/* Card icon */}
      <div
        className="mb-6 flex h-14 w-14 items-center justify-center text-white relative z-10"
        style={{
          background: 'linear-gradient(135deg, #c4653a, #8b4528)',
          borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
        }}
      >
        <CreditCard className="h-7 w-7" />
      </div>

      {/* Title */}
      <h1
        className="text-xl font-bold mb-1 relative z-10"
        style={{ fontFamily: 'var(--font-outfit), system-ui, sans-serif', color: '#3d2c22' }}
      >
        Twoja karta lojalnosciowa
      </h1>
      <p className="text-base mb-6 relative z-10" style={{ color: '#a8928a' }}>{displayName}</p>

      {/* QR Code */}
      <div className="relative z-10">
        <QRCodeDisplay value={`loyalty:customer:${customerId}`} size={240} />
      </div>

      {/* Customer ID */}
      <p className="mt-4 text-sm font-mono tracking-wider relative z-10" style={{ color: '#a8928a' }}>
        {customerId.toUpperCase()}
      </p>

      {/* Brightness hint */}
      <div
        className="mt-8 flex items-center gap-2 rounded-full px-4 py-2.5 relative z-10"
        style={{ background: 'rgba(196, 161, 58, 0.1)' }}
      >
        <Sun className="h-4 w-4" style={{ color: '#a88832' }} />
        <span className="text-sm font-medium" style={{ color: '#8b7b35' }}>
          Zwieksz jasnosc ekranu do skanowania
        </span>
      </div>

      {/* Close button at bottom */}
      <Button
        onClick={() => router.back()}
        variant="outline"
        className="mt-8 h-14 w-full max-w-xs rounded-2xl text-lg font-semibold relative z-10"
        style={{ borderColor: 'rgba(196, 101, 58, 0.3)', color: '#c4653a' }}
      >
        Zamknij
      </Button>
    </div>
  );
}
