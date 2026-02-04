'use client';

import { useEffect, useState } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { onSyncStatusChange, getSyncStatus, getPendingCount, type SyncStatus } from '@/lib/sync-engine';

export function SyncIndicator() {
  const [status, setStatus] = useState<SyncStatus>('online');
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    // Get initial state
    setStatus(typeof navigator !== 'undefined' && navigator.onLine ? 'online' : 'offline');
    getPendingCount().then(setPendingCount).catch(() => {});

    const unsubscribe = onSyncStatusChange((newStatus, count) => {
      setStatus(newStatus);
      setPendingCount(count);
    });

    return unsubscribe;
  }, []);

  return (
    <div
      className="flex items-center gap-2 rounded-full px-4 py-2"
      style={{
        background: 'rgba(6, 6, 10, 0.7)',
        border: '1px solid rgba(0, 212, 255, 0.1)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {status === 'online' && (
        <>
          <div
            className="h-3 w-3 rounded-full"
            style={{
              background: '#00ff88',
              boxShadow: '0 0 8px rgba(0, 255, 136, 0.6), 0 0 20px rgba(0, 255, 136, 0.2)',
            }}
          />
          <Wifi className="h-4 w-4" style={{ color: '#00ff88', filter: 'drop-shadow(0 0 4px rgba(0, 255, 136, 0.4))' }} />
          <span className="text-sm font-medium" style={{ color: '#00ff88' }}>Online</span>
        </>
      )}
      {status === 'syncing' && (
        <>
          <div
            className="sync-pulse h-3 w-3 rounded-full"
            style={{
              background: '#00d4ff',
              boxShadow: '0 0 8px rgba(0, 212, 255, 0.6), 0 0 20px rgba(0, 212, 255, 0.2)',
            }}
          />
          <RefreshCw className="h-4 w-4 animate-spin" style={{ color: '#00d4ff', filter: 'drop-shadow(0 0 4px rgba(0, 212, 255, 0.4))' }} />
          <span className="text-sm font-medium" style={{ color: '#00d4ff' }}>
            Syncing...
          </span>
        </>
      )}
      {status === 'offline' && (
        <>
          <div
            className="sync-pulse h-3 w-3 rounded-full"
            style={{
              background: '#ff4d6a',
              boxShadow: '0 0 8px rgba(255, 77, 106, 0.6), 0 0 20px rgba(255, 77, 106, 0.2)',
            }}
          />
          <WifiOff className="h-4 w-4" style={{ color: '#ff4d6a', filter: 'drop-shadow(0 0 4px rgba(255, 77, 106, 0.4))' }} />
          <span className="text-sm font-medium" style={{ color: '#ff4d6a' }}>
            Offline{pendingCount > 0 ? ` (${pendingCount} pending)` : ''}
          </span>
        </>
      )}
    </div>
  );
}
