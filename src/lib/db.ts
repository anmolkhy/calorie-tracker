import db, { initDB } from '@/db/schema';
import { seedFoods } from '@/db/seed';

let initialized = false;

export function ensureDB(): void {
  if (initialized) return;
  initDB();
  seedFoods();
  initialized = true;
}

// Auto-initialize when this module is first imported
ensureDB();

export default db;