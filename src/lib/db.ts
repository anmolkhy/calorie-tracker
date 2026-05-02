import db, { initDB } from '@/db/schema';
import { seedFoods } from '@/db/seed';

let initialized = false;

export function ensureDB(): void {
  if (initialized) return;
  initDB();
  seedFoods();
  initialized = true;
}

export default db;