import { NextRequest, NextResponse } from 'next/server';
import client from '@/lib/db';
import { getSession } from '@/lib/auth';
import { handleApi } from '@/lib/api';
import { validateQuantity } from '@/lib/validate';
import { calculateMacros, sumMacros } from '@/lib/calculate';

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

export async function GET(req: NextRequest) {
  return handleApi(async () => {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date') ?? new Date().toISOString().split('T')[0];

    const logResult = await client.execute({
      sql: 'SELECT * FROM daily_logs WHERE user_id = ? AND date = ?',
      args: [session.id, date],
    });

    if (logResult.rows.length === 0) {
      return NextResponse.json({
        entries: [],
        totals: { calories: 0, protein: 0, carbs: 0, fat: 0 },
      });
    }

    const log = logResult.rows[0];

    const entries = await client.execute({
      sql: `SELECT le.*, f.name, f.calories_per_100g, f.protein_per_100g,
                   f.carbs_per_100g, f.fat_per_100g, m.name as meal_name
            FROM log_entries le
            JOIN foods f ON f.id = le.food_id
            LEFT JOIN meals m ON m.id = le.meal_id
            WHERE le.daily_log_id = ?
            ORDER BY le.logged_at ASC`,
      args: [Number(log.id)],
    });

    const entriesWithMacros = entries.rows.map(entry => ({
      ...entry,
      macros: calculateMacros(
        {
          calories_per_100g: Number(entry.calories_per_100g),
          protein_per_100g: Number(entry.protein_per_100g),
          carbs_per_100g: Number(entry.carbs_per_100g),
          fat_per_100g: Number(entry.fat_per_100g),
        },
        Number(entry.quantity_grams)
      ),
    }));

    const totals = sumMacros(entriesWithMacros.map(e => e.macros));
    return NextResponse.json({ entries: entriesWithMacros, totals });
  });
}

export async function POST(req: NextRequest) {
  return handleApi(async () => {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const food_id = Number(body.food_id);
    const quantity_grams = validateQuantity(body.quantity_grams);
    const date = body.date ?? new Date().toISOString().split('T')[0];
    const meal_id = body.meal_id ? Number(body.meal_id) : null;

    if (!food_id) return NextResponse.json({ error: 'food_id is required' }, { status: 400 });

    const dailyLogId = await getOrCreateDailyLog(session.id, date);

    await client.execute({
      sql: 'INSERT INTO log_entries (daily_log_id, food_id, quantity_grams, meal_id) VALUES (?, ?, ?, ?)',
      args: [dailyLogId, food_id, quantity_grams, meal_id],
    });

    return NextResponse.json({ success: true }, { status: 201 });
  });
}