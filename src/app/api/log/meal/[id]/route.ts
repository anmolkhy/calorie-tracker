import { NextRequest, NextResponse } from 'next/server';
import client from '@/lib/db';
import { getSession } from '@/lib/auth';
import { handleApi } from '@/lib/api';

type RouteParams = { params: Promise<{ id: string }> };

async function getOrCreateDailyLog(userId: number, date: string): Promise<number> {
  const existing = await client.execute({
    sql: 'SELECT id FROM daily_logs WHERE user_id = ? AND date = ?',
    args: [userId, date],
  });

  if (existing.rows.length > 0) return Number(existing.rows[0].id);

  const result = await client.execute({
    sql: 'INSERT INTO daily_logs (user_id, date) VALUES (?, ?)',
    args: [userId, date],
  });
  return Number(result.lastInsertRowid);
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  return handleApi(async () => {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const mealId = Number(id);

    const body = await req.json().catch(() => ({}));
    const date = body.date ?? new Date().toISOString().split('T')[0];

    const meal = await client.execute({
      sql: 'SELECT * FROM meals WHERE id = ? AND user_id = ?',
      args: [mealId, session.id],
    });

    if (meal.rows.length === 0) return NextResponse.json({ error: 'Meal not found' }, { status: 404 });

    const items = await client.execute({
      sql: 'SELECT * FROM meal_items WHERE meal_id = ?',
      args: [mealId],
    });

    if (items.rows.length === 0) return NextResponse.json({ error: 'Meal has no items' }, { status: 400 });

    const dailyLogId = await getOrCreateDailyLog(session.id, date);

    for (const item of items.rows) {
      await client.execute({
        sql: 'INSERT INTO log_entries (daily_log_id, food_id, quantity_grams, meal_id) VALUES (?, ?, ?, ?)',
        args: [dailyLogId, Number(item.food_id), Number(item.quantity_grams), mealId],
      });
    }

    return NextResponse.json({ success: true, logged: items.rows.length });
  });
}