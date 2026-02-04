import { getKioskDB } from './db';

export type SyncStatus = 'online' | 'syncing' | 'offline';

type SyncStatusListener = (status: SyncStatus, pendingCount: number) => void;

const listeners = new Set<SyncStatusListener>();
let currentStatus: SyncStatus = 'online';
let syncIntervalId: ReturnType<typeof setInterval> | null = null;

function notifyListeners(status: SyncStatus, pendingCount: number) {
  currentStatus = status;
  listeners.forEach((listener) => listener(status, pendingCount));
}

export function onSyncStatusChange(listener: SyncStatusListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSyncStatus() {
  return currentStatus;
}

export async function addPendingOperation(operation: {
  operation: string;
  payload: Record<string, unknown>;
}) {
  const db = await getKioskDB();
  const id = crypto.randomUUID();
  const idempotencyKey = crypto.randomUUID();
  const timestamp = new Date().toISOString();

  const entry = {
    id,
    operation: operation.operation,
    payload: operation.payload,
    timestamp,
    idempotencyKey,
  };

  await db.put('pendingOperations', entry);

  const count = await db.count('pendingOperations');
  notifyListeners(navigator.onLine ? 'online' : 'offline', count);

  // Attempt immediate sync if online
  if (navigator.onLine) {
    syncPendingOperations().catch(() => {
      // Sync failed, will retry on next interval
    });
  }

  return entry;
}

export async function getPendingCount(): Promise<number> {
  const db = await getKioskDB();
  return db.count('pendingOperations');
}

export async function syncPendingOperations(): Promise<void> {
  if (!navigator.onLine) {
    const db = await getKioskDB();
    const count = await db.count('pendingOperations');
    notifyListeners('offline', count);
    return;
  }

  const db = await getKioskDB();
  const allOps = await db.getAllFromIndex('pendingOperations', 'by-timestamp');

  if (allOps.length === 0) {
    notifyListeners('online', 0);
    return;
  }

  notifyListeners('syncing', allOps.length);

  try {
    const deviceToken = localStorage.getItem('kiosk-device-token') || '';

    const response = await fetch('/api/kiosk/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Device-Token': deviceToken,
      },
      body: JSON.stringify({ operations: allOps }),
    });

    if (!response.ok) {
      throw new Error(`Sync failed: ${response.status}`);
    }

    const result = await response.json();

    // Remove successfully synced operations
    const syncedIds: string[] = result.synced || allOps.map((op: { id: string }) => op.id);
    const tx = db.transaction('pendingOperations', 'readwrite');
    await Promise.all(syncedIds.map((id: string) => tx.store.delete(id)));
    await tx.done;

    const remainingCount = await db.count('pendingOperations');
    notifyListeners(remainingCount > 0 ? 'syncing' : 'online', remainingCount);
  } catch (error) {
    const count = await db.count('pendingOperations');
    notifyListeners(navigator.onLine ? 'online' : 'offline', count);
    throw error;
  }
}

export function startSyncLoop() {
  if (syncIntervalId) return;

  // Initial status check
  const updateOnlineStatus = async () => {
    const count = await getPendingCount();
    if (navigator.onLine) {
      if (count > 0) {
        syncPendingOperations().catch(() => {});
      } else {
        notifyListeners('online', 0);
      }
    } else {
      notifyListeners('offline', count);
    }
  };

  // Listen for online/offline events
  window.addEventListener('online', () => {
    syncPendingOperations().catch(() => {});
  });

  window.addEventListener('offline', async () => {
    const count = await getPendingCount();
    notifyListeners('offline', count);
  });

  // Sync every 30 seconds
  syncIntervalId = setInterval(() => {
    if (navigator.onLine) {
      syncPendingOperations().catch(() => {});
    }
  }, 30_000);

  // Initial check
  updateOnlineStatus();
}

export function stopSyncLoop() {
  if (syncIntervalId) {
    clearInterval(syncIntervalId);
    syncIntervalId = null;
  }
}

export async function cacheCustomer(customer: {
  id: string;
  phone: string;
  data: any;
}) {
  const db = await getKioskDB();
  await db.put('cachedCustomers', {
    id: customer.id,
    phone: customer.phone,
    data: customer.data,
    cachedAt: new Date().toISOString(),
  });
}

export async function getCachedCustomerByPhone(
  phone: string
): Promise<{ id: string; phone: string; data: any; cachedAt: string } | undefined> {
  const db = await getKioskDB();
  return db.getFromIndex('cachedCustomers', 'by-phone', phone);
}
