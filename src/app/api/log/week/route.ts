import { NextResponse } from 'next/server';
import client from '@/lib/db';
import { getSession } from '@/lib/auth';
import { handleApi } from '@/lib/api';
import { calculateMacros, sumMacros } from '@/lib/calculate';

export async function GET() {
  return handleApi(async () => {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const days: string[] = [];
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }

    const week = await Promise.all(days.map(async date => {
      const logResult = await client.execute({
        sql: 'SELECT id FROM daily_logs WHERE user_id = ? AND date = ?',
        args: [session.id, date],
      });

      if (logResult.rows.length === 0) {
        return { date, totals: { calories: 0, protein: 0, carbs: 0, fat: 0 } };
      }

      const logId = Number(logResult.rows[0].id);

      const entries = await client.execute({
        sql: `SELECT le.quantity_grams, f.calories_per_100g, f.protein_per_100g,
                     f.carbs_per_100g, f.fat_per_100g
              FROM log_entries le
              JOIN foods f ON f.id = le.food_id
              WHERE le.daily_log_id = ?`,
        args: [logId],
      });

      const totals = sumMacros(
        entries.rows.map(e => calculateMacros(
          {
            calories_per_100g: Number(e.calories_per_100g),
            protein_per_100g: Number(e.protein_per_100g),
            carbs_per_100g: Number(e.carbs_per_100g),
            fat_per_100g: Number(e.fat_per_100g),
          },
          Number(e.quantity_grams)
        ))
      );

      return { date, totals };
    }));

    return NextResponse.json({ week });
  });
}