'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, RotateCcw } from 'lucide-react';

export default function ConfirmPage() {
  return (
    <Suspense fallback={
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-14 w-14 rounded-full" style={{ border: '3px solid rgba(0, 212, 255, 0.2)', borderTopColor: '#00d4ff', animation: 'spin 1s linear infinite' }}>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    }>
      <ConfirmContent />
    </Suspense>
  );
}

function ConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const type = searchParams.get('type') || 'success';
  const message = searchParams.get('message') || 'Transaction Complete';
  const customerName = searchParams.get('customer') || '';

  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (type !== 'success') return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          router.replace('/kiosk');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [type, router]);

  const handleDone = () => {
    router.replace('/kiosk');
  };

  const handleRetry = () => {
    router.back();
  };

  if (type === 'error') {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center px-8">
        <div className="animate-error-burst">
          <div
            className="mx-auto flex h-40 w-40 items-center justify-center rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(255, 77, 106, 0.15) 0%, rgba(255, 77, 106, 0.05) 70%, transparent 100%)',
              border: '2px solid rgba(255, 77, 106, 0.3)',
            }}
          >
            <XCircle className="h-28 w-28" style={{ color: '#ff4d6a', filter: 'drop-shadow(0 0 20px rgba(255, 77, 106, 0.5))' }} />
          </div>
        </div>

        <h1 className="text-glow-coral mt-8 text-5xl font-bold" style={{ color: '#e8edf4' }}>
          Something Went Wrong
        </h1>
        <p className="text-glow-coral mt-4 text-2xl" style={{ color: '#ff4d6a' }}>{message}</p>

        <div className="mt-12 flex gap-6">
          <button
            onClick={handleRetry}
            className="btn-futuristic-ghost touch-target px-12 text-2xl font-semibold"
          >
            <RotateCcw className="mr-3 inline h-7 w-7" />
            Retry
          </button>

          <button
            onClick={handleDone}
            className="btn-futuristic-danger touch-target px-12 text-2xl font-semibold"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  // Success view
  return (
    <div className="flex h-full w-full flex-col items-center justify-center px-8">
      <div className="animate-success-burst">
        <div
          className="mx-auto flex h-40 w-40 items-center justify-center rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(0, 255, 136, 0.15) 0%, rgba(0, 255, 136, 0.05) 70%, transparent 100%)',
            border: '2px solid rgba(0, 255, 136, 0.3)',
          }}
        >
          <svg
            className="h-28 w-28"
            style={{ color: '#00ff88', filter: 'drop-shadow(0 0 20px rgba(0, 255, 136, 0.5))' }}
            viewBox="0 0 52 52"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="26"
              cy="26"
              r="24"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              opacity="0.3"
            />
            <path
              className="animate-check"
              d="M14 27 L22 35 L38 19"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>
      </div>

      <h1 className="text-glow-emerald mt-8 text-5xl font-bold" style={{ color: '#e8edf4' }}>
        Transaction Complete
      </h1>

      {customerName && (
        <p className="mt-3 text-2xl font-light" style={{ color: '#4a5568' }}>Thank you, {customerName}!</p>
      )}

      <p className="text-glow-emerald mt-4 text-3xl font-semibold" style={{ color: '#00ff88' }}>{message}</p>

      <div className="mt-12">
        <button
          onClick={handleDone}
          className="btn-futuristic-success touch-target px-16 text-2xl font-semibold"
        >
          Done
        </button>
      </div>

      <p className="mt-6 text-lg font-light" style={{ color: '#4a5568' }}>
        Returning to home in {countdown}s...
      </p>
    </div>
  );
}
