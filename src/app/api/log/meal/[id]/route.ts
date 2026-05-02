import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';
import { handleApi } from '@/lib/api';
import type { Meal, MealItem } from '@/types/db';

type RouteParams = { params: Promise<{ id: string }> };

function getOrCreateDailyLog(userId: number, date: string): number {
  const log = db.prepare(
    'SELECT id FROM daily_logs WHERE user_id = ? AND date = ?'
  ).get(userId, date) as { id: number } | undefined;

  if (!log) {
    const result = db.prepare(
      'INSERT INTO daily_logs (user_id, date) VALUES (?, ?)'
    ).run(userId, date);
    return result.lastInsertRowid as number;
  }
  return log.id;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  return handleApi(async () => {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const mealId = Number(id);

    const body = await req.json().catch(() => ({}));
    const date = body.date ?? new Date().toISOString().split('T')[0];

    const meal = db.prepare(
      'SELECT * FROM meals WHERE id = ? AND user_id = ?'
    ).get(mealId, session.id) as Meal | undefined;

    if (!meal) return NextResponse.json({ error: 'Meal not found' }, { status: 404 });

    const items = db.prepare(
      'SELECT * FROM meal_items WHERE meal_id = ?'
    ).all(mealId) as MealItem[];

    if (items.length === 0) {
      return NextResponse.json({ error: 'Meal has no items' }, { status: 400 });
    }

    const dailyLogId = getOrCreateDailyLog(session.id, date);

    const insertEntry = db.prepare(`
      INSERT INTO log_entries (daily_log_id, food_id, quantity_grams, meal_id)
      VALUES (?, ?, ?, ?)
    `);

    db.transaction(() => {
      for (const item of items) {
        insertEntry.run(dailyLogId, item.food_id, item.quantity_grams, mealId);
      }
    })();

    return NextResponse.json({ success: true, logged: items.length });
  });
}