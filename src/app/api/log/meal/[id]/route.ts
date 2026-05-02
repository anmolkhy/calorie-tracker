import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';

function getOrCreateDailyLog(userId: number, date: string): number {
  let log = db.prepare('SELECT id FROM daily_logs WHERE user_id = ? AND date = ?')
    .get(userId, date) as { id: number } | undefined;

  if (!log) {
    const result = db.prepare('INSERT INTO daily_logs (user_id, date) VALUES (?, ?)').run(userId, date);
    return result.lastInsertRowid as number;
  }
  return log.id;
}

// POST log an entire meal in one click
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { date } = await req.json().catch(() => ({}));
  const logDate = date || new Date().toISOString().split('T')[0];

  const meal = db.prepare('SELECT * FROM meals WHERE id = ? AND user_id = ?')
    .get(Number(params.id), session.id);

  if (!meal) return NextResponse.json({ error: 'Meal not found' }, { status: 404 });

  const items = db.prepare('SELECT * FROM meal_items WHERE meal_id = ?')
    .all(Number(params.id)) as { food_id: number; quantity_grams: number }[];

  if (items.length === 0) return NextResponse.json({ error: 'Meal has no items' }, { status: 400 });

  const dailyLogId = getOrCreateDailyLog(session.id, logDate);

  const insertEntry = db.prepare(`
    INSERT INTO log_entries (daily_log_id, food_id, quantity_grams, meal_id)
    VALUES (?, ?, ?, ?)
  `);

  const logMeal = db.transaction(() => {
    for (const item of items) {
      insertEntry.run(dailyLogId, item.food_id, item.quantity_grams, Number(params.id));
    }
  });

  logMeal();

  return NextResponse.json({ success: true, logged: items.length });
}