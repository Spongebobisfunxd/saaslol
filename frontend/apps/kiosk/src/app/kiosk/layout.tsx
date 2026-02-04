'use client';

import { useEffect, useState } from 'react';
import { SyncIndicator } from '@/components/sync-indicator';

function Clock() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    };

    update();
    const interval = setInterval(update, 10_000);
    return () => clearInterval(interval);
  }, []);

  if (!time) return null;

  return (
    <span
      className="text-glow-cyan text-lg font-medium tracking-widest"
      style={{ color: '#00d4ff' }}
    >
      {time}
    </span>
  );
}

export default function KioskLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex h-full w-full flex-col">
      {/* Animated grid background */}
      <div className="futuristic-grid-bg" />
      <div className="scanline-overlay" />

      {/* Top status bar */}
      <div className="futuristic-status-bar absolute left-0 right-0 top-0 z-50 flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          <div
            className="h-2 w-2 rounded-full"
            style={{
              background: '#00d4ff',
              boxShadow: '0 0 8px rgba(0, 212, 255, 0.6)',
            }}
          />
          <Clock />
        </div>
        <SyncIndicator />
      </div>

      {/* Main content area */}
      <div className="relative z-10 flex h-full w-full items-center justify-center pt-14">
        {children}
      </div>
    </div>
  );
}
