'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Monitor, Wifi } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('kiosk-device-token');
    if (token) {
      router.replace('/kiosk');
    } else {
      setChecking(false);
    }
  }, [router]);

  if (checking) {
    return (
      <div className="relative flex h-full items-center justify-center">
        <div className="futuristic-grid-bg" />
        <div className="scanline-overlay" />
        <div className="relative z-10 text-center">
          <div className="neon-pulse mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-[rgba(0,212,255,0.3)]">
            <Monitor className="h-14 w-14 animate-pulse" style={{ color: '#00d4ff' }} />
          </div>
          <p className="text-glow-cyan mt-6 text-2xl font-light tracking-widest" style={{ color: '#e8edf4' }}>
            Initializing Kiosk...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-full items-center justify-center">
      <div className="futuristic-grid-bg" />
      <div className="scanline-overlay" />

      <div className="holo-card relative z-10 w-full max-w-lg p-12">
        <div className="text-center">
          <div className="neon-pulse mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-[rgba(0,212,255,0.3)]" style={{ background: 'rgba(0, 212, 255, 0.08)' }}>
            <Wifi className="h-12 w-12" style={{ color: '#00d4ff' }} />
          </div>
          <h1 className="text-glow-cyan mt-8 text-4xl font-bold tracking-tight" style={{ color: '#e8edf4' }}>
            Kiosk Setup
          </h1>
          <p className="mt-4 text-xl font-light" style={{ color: '#4a5568' }}>
            This device needs to be registered before it can be used as a kiosk.
          </p>
          <button
            onClick={() => router.push('/setup')}
            className="btn-futuristic-primary touch-target mt-10 w-full px-8 text-2xl font-semibold"
          >
            Set Up Device
          </button>
        </div>
      </div>
    </div>
  );
}
