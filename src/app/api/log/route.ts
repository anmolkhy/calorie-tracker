import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';
import { calculateMacros, sumMacros } from '@/lib/calculate';

function getOrCreateDailyLog(userId: number, date: string): number {
  let log = db.prepare('SELECT id FROM daily_logs WHERE user_id = ? AND date = ?')
    .get(userId, date) as { id: number } | undefined;

  if (!log) {
    const result = db.prepare('INSERT INTO daily_logs (user_id, date) VALUES (?, ?)').run(userId, date);
    return result.lastInsertRowid as number;
  }
  return log.id;
}

// GET log for a date
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

  const log = db.prepare('SELECT * FROM daily_logs WHERE user_id = ? AND date = ?')
    .get(session.id, date) as { id: number } | undefined;

  if (!log) return NextResponse.json({ entries: [], totals: { calories: 0, protein: 0, carbs: 0, fat: 0 } });

  const entries = db.prepare(`
    SELECT le.*, f.name, f.calories_per_100g, f.protein_per_100g,
           f.carbs_per_100g, f.fat_per_100g, m.name as meal_name
    FROM log_entries le
    JOIN foods f ON f.id = le.food_id
    LEFT JOIN meals m ON m.id = le.meal_id
    WHERE le.daily_log_id = ?
    ORDER BY le.logged_at ASC
  `).all(log.id) as any[];

  const entriesWithMacros = entries.map(entry => ({
    ...entry,
    macros: calculateMacros(
      { calories_per_100g: entry.calories_per_100g, protein_per_100g: entry.protein_per_100g, carbs_per_100g: entry.carbs_per_100g, fat_per_100g: entry.fat_per_100g },
      entry.quantity_grams
    )
  }));

  const totals = sumMacros(entriesWithMacros.map(e => e.macros));

  return NextResponse.json({ entries: entriesWithMacros, totals });
}

// POST add a single food entry
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { food_id, quantity_grams, date, meal_id } = await req.json();

  if (!food_id || !quantity_grams) {
    return NextResponse.json({ error: 'food_id and quantity_grams are required' }, { status: 400 });
  }

  const logDate = date || new Date().toISOString().split('T')[0];
  const dailyLogId = getOrCreateDailyLog(session.id, logDate);

  db.prepare(`
    INSERT INTO log_entries (daily_log_id, food_id, quantity_grams, meal_id)
    VALUES (?, ?, ?, ?)
  `).run(dailyLogId, food_id, quantity_grams, meal_id || null);

  return NextResponse.json({ success: true }, { status: 201 });
}