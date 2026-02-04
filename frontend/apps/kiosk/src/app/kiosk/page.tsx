'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ScanLine, UserSearch, Star } from 'lucide-react';
import { Numpad } from '@/components/numpad';
import { getCachedCustomerByPhone } from '@/lib/sync-engine';

function formatPhoneDisplay(value: string): string {
  if (value.length <= 3) return value;
  if (value.length <= 6) return `(${value.slice(0, 3)}) ${value.slice(3)}`;
  return `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6)}`;
}

export default function KioskMainPage() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');

  const handlePhoneLookup = async () => {
    if (phoneNumber.length < 7) {
      setError('Please enter a valid phone number');
      return;
    }

    setSearching(true);
    setError('');

    try {
      const deviceToken = localStorage.getItem('kiosk-device-token') || '';

      // Try online lookup first
      if (navigator.onLine) {
        const response = await fetch(
          `/api/kiosk/customer/lookup?phone=${encodeURIComponent(phoneNumber)}`,
          {
            headers: { 'X-Device-Token': deviceToken },
          }
        );

        if (response.ok) {
          const customer = await response.json();
          // Cache customer for offline use
          const { cacheCustomer } = await import('@/lib/sync-engine');
          await cacheCustomer({
            id: customer.id,
            phone: phoneNumber,
            data: customer,
          });
          router.push(`/kiosk/customer?id=${customer.id}`);
          return;
        }

        if (response.status === 404) {
          setError('Customer not found. Try again or register as new.');
          setSearching(false);
          return;
        }
      }

      // Fallback to cached data when offline
      const cached = await getCachedCustomerByPhone(phoneNumber);
      if (cached) {
        router.push(`/kiosk/customer?id=${cached.id}&offline=true`);
        return;
      }

      setError(
        navigator.onLine
          ? 'Customer not found.'
          : 'Offline - customer not in cache.'
      );
    } catch (err) {
      // Try offline cache on network error
      const cached = await getCachedCustomerByPhone(phoneNumber);
      if (cached) {
        router.push(`/kiosk/customer?id=${cached.id}&offline=true`);
        return;
      }
      setError('Connection error. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="flex h-full w-full flex-col px-8 pb-8">
      {/* Welcome header */}
      <div className="mb-6 text-center">
        <div className="flex items-center justify-center gap-4">
          <Star className="float-animation h-8 w-8" style={{ color: '#00d4ff', filter: 'drop-shadow(0 0 8px rgba(0, 212, 255, 0.5))' }} fill="currentColor" />
          <h1 className="text-glow-cyan text-5xl font-bold tracking-tight" style={{ color: '#e8edf4' }}>
            Welcome
          </h1>
          <Star className="float-animation h-8 w-8" style={{ color: '#00d4ff', filter: 'drop-shadow(0 0 8px rgba(0, 212, 255, 0.5))', animationDelay: '1s' }} fill="currentColor" />
        </div>
        <p className="mt-2 text-xl font-light tracking-wide" style={{ color: '#4a5568' }}>
          Look up your account to earn and redeem rewards
        </p>
      </div>

      {/* Two-column layout for landscape */}
      <div className="grid flex-1 grid-cols-2 gap-8">
        {/* Left: Phone numpad */}
        <div className="holo-card flex flex-col p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: 'rgba(0, 212, 255, 0.1)', border: '1px solid rgba(0, 212, 255, 0.2)' }}>
              <UserSearch className="h-6 w-6" style={{ color: '#00d4ff' }} />
            </div>
            <h2 className="text-glow-cyan text-2xl font-semibold" style={{ color: '#e8edf4' }}>
              Enter Phone Number
            </h2>
          </div>

          <div className="flex-1">
            <Numpad
              value={phoneNumber}
              onChange={(v) => {
                setPhoneNumber(v);
                setError('');
              }}
              onSubmit={handlePhoneLookup}
              maxLength={10}
              placeholder="(___) ___-____"
              formatDisplay={formatPhoneDisplay}
            />
          </div>

          {error && (
            <div className="glow-border-coral mt-3 px-4 py-3 text-center" style={{ background: 'rgba(255, 77, 106, 0.08)' }}>
              <p className="text-glow-coral text-lg" style={{ color: '#ff4d6a' }}>{error}</p>
            </div>
          )}

          {searching && (
            <div className="mt-3 text-center">
              <p className="text-glow-cyan animate-pulse text-lg" style={{ color: '#00d4ff' }}>
                Looking up account...
              </p>
            </div>
          )}
        </div>

        {/* Right: QR scanner placeholder */}
        <div className="holo-card flex flex-col items-center justify-center p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: 'rgba(0, 212, 255, 0.1)', border: '1px solid rgba(0, 212, 255, 0.2)' }}>
              <ScanLine className="h-6 w-6" style={{ color: '#00d4ff' }} />
            </div>
            <h2 className="text-glow-cyan text-2xl font-semibold" style={{ color: '#e8edf4' }}>
              Scan QR Code
            </h2>
          </div>

          <div className="scanner-area corner-brackets flex h-64 w-64 flex-col items-center justify-center rounded-2xl" style={{ background: 'rgba(0, 212, 255, 0.03)', border: '1px solid rgba(0, 212, 255, 0.15)' }}>
            <ScanLine className="h-20 w-20" style={{ color: 'rgba(0, 212, 255, 0.2)' }} />
            <p className="mt-4 text-center text-lg font-light" style={{ color: 'rgba(0, 212, 255, 0.3)' }}>
              Camera
              <br />
              Scanner
            </p>
          </div>

          <p className="mt-6 max-w-xs text-center text-lg font-light" style={{ color: '#4a5568' }}>
            Hold your QR code up to the camera to quickly access your account
          </p>
        </div>
      </div>
    </div>
  );
}
