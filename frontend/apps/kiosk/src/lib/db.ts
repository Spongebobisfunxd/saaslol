import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface KioskDB extends DBSchema {
  pendingOperations: {
    key: string;
    value: {
      id: string;
      operation: string;
      payload: Record<string, unknown>;
      timestamp: string;
      idempotencyKey: string;
    };
    indexes: { 'by-timestamp': string };
  };
  cachedCustomers: {
    key: string;
    value: { id: string; phone: string; data: any; cachedAt: string };
    indexes: { 'by-phone': string };
  };
}

let dbPromise: Promise<IDBPDatabase<KioskDB>>;

export function getKioskDB() {
  if (!dbPromise) {
    dbPromise = openDB<KioskDB>('loyalty-kiosk', 1, {
      upgrade(db) {
        const opStore = db.createObjectStore('pendingOperations', {
          keyPath: 'id',
        });
        opStore.createIndex('by-timestamp', 'timestamp');

        const custStore = db.createObjectStore('cachedCustomers', {
          keyPath: 'id',
        });
        custStore.createIndex('by-phone', 'phone');
      },
    });
  }
  return dbPromise;
}

export type { KioskDB };
