'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Monitor, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function SetupPage() {
  const router = useRouter();
  const [deviceToken, setDeviceToken] = useState('');
  const [status, setStatus] = useState<'idle' | 'connecting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleConnect = async () => {
    if (!deviceToken.trim()) return;

    setStatus('connecting');
    setErrorMessage('');

    try {
      const response = await fetch('/api/kiosk/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Device-Token': deviceToken.trim(),
        },
        body: JSON.stringify({ token: deviceToken.trim() }),
      });

      if (!response.ok) {
        throw new Error(
          response.status === 401
            ? 'Invalid device token. Please check and try again.'
            : `Connection failed (${response.status}). Please try again.`
        );
      }

      localStorage.setItem('kiosk-device-token', deviceToken.trim());
      setStatus('success');

      setTimeout(() => {
        router.replace('/kiosk');
      }, 1500);
    } catch (err) {
      setStatus('error');
      setErrorMessage(
        err instanceof Error ? err.message : 'Connection failed. Please try again.'
      );
    }
  };

  return (
    <div className="relative flex h-full items-center justify-center">
      <div className="futuristic-grid-bg" />
      <div className="scanline-overlay" />

      <div className="holo-card relative z-10 w-full max-w-xl p-12">
        <div className="text-center">
          <div className="neon-pulse mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-[rgba(0,212,255,0.3)]" style={{ background: 'rgba(0, 212, 255, 0.08)' }}>
            <Monitor className="h-12 w-12" style={{ color: '#00d4ff' }} />
          </div>
          <h1 className="text-glow-cyan mt-8 text-4xl font-bold tracking-tight" style={{ color: '#e8edf4' }}>
            Device Registration
          </h1>
          <p className="mt-4 text-lg font-light" style={{ color: '#4a5568' }}>
            Enter the device token provided by your administrator.
          </p>
        </div>

        <div className="mt-10 space-y-6">
          <div>
            <label
              htmlFor="device-token"
              className="block text-lg font-medium" style={{ color: 'rgba(0, 212, 255, 0.7)' }}
            >
              Device Token
            </label>
            <input
              id="device-token"
              type="text"
              value={deviceToken}
              onChange={(e) => setDeviceToken(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
              placeholder="Enter device token..."
              disabled={status === 'connecting' || status === 'success'}
              className="input-futuristic mt-3 block w-full px-6 py-5 text-xl"
            />
          </div>

          {status === 'error' && (
            <div className="glow-border-coral flex items-center gap-3 px-6 py-4" style={{ background: 'rgba(255, 77, 106, 0.08)' }}>
              <AlertCircle className="h-6 w-6 flex-shrink-0" style={{ color: '#ff4d6a' }} />
              <p className="text-lg" style={{ color: '#ff4d6a' }}>{errorMessage}</p>
            </div>
          )}

          {status === 'success' && (
            <div className="glow-border-emerald flex items-center gap-3 px-6 py-4" style={{ background: 'rgba(0, 255, 136, 0.08)' }}>
              <CheckCircle className="h-6 w-6 flex-shrink-0" style={{ color: '#00ff88' }} />
              <p className="text-lg" style={{ color: '#00ff88' }}>
                Connected successfully! Redirecting...
              </p>
            </div>
          )}

          <button
            onClick={handleConnect}
            disabled={!deviceToken.trim() || status === 'connecting' || status === 'success'}
            className="btn-futuristic-primary touch-target w-full px-8 text-2xl font-semibold disabled:cursor-not-allowed disabled:opacity-40"
          >
            {status === 'connecting' ? (
              <span className="flex items-center justify-center gap-3">
                <Loader2 className="h-7 w-7 animate-spin" />
                Connecting...
              </span>
            ) : status === 'success' ? (
              <span className="flex items-center justify-center gap-3">
                <CheckCircle className="h-7 w-7" />
                Connected
              </span>
            ) : (
              'Connect'
            )}
          </button>

          <button
            onClick={() => router.push('/')}
            className="w-full py-4 text-lg transition-colors" style={{ color: '#4a5568' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#00d4ff')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#4a5568')}
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
