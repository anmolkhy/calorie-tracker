import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';
import { handleApi } from '@/lib/api';
import { calculateMacros, sumMacros } from '@/lib/calculate';

type WeekEntryRow = {
  quantity_grams: number;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
};

export async function GET() {
  return handleApi(async () => {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const days: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }

    const week = days.map(date => {
      const log = db.prepare(
        'SELECT id FROM daily_logs WHERE user_id = ? AND date = ?'
      ).get(session.id, date) as { id: number } | undefined;

      if (!log) return { date, totals: { calories: 0, protein: 0, carbs: 0, fat: 0 } };

      const entries = db.prepare(`
        SELECT le.quantity_grams, f.calories_per_100g, f.protein_per_100g,
               f.carbs_per_100g, f.fat_per_100g
        FROM log_entries le
        JOIN foods f ON f.id = le.food_id
        WHERE le.daily_log_id = ?
      `).all(log.id) as WeekEntryRow[];

      const totals = sumMacros(
        entries.map(e => calculateMacros(e, e.quantity_grams))
      );

      return { date, totals };
    });

    return NextResponse.json({ week });
  });
}