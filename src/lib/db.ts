import client, { initDB } from '@/db/schema';
import { seedFoods } from '@/db/seed';

let initialized = false;

export async function ensureDB(): Promise<void> {
  if (initialized) return;
  await initDB();
  await seedFoods();
  initialized = true;
}

export default client;