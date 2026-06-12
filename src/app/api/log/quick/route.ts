import { NextRequest, NextResponse } from 'next/server';
import client from '@/lib/db';
import { getSession } from '@/lib/auth';
import { handleApi } from '@/lib/api';
import { ValidationError, validateString } from '@/lib/validate';

const QUICK_LOG_FOOD_ID = -1;

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

function validateCalories(calories: unknown): number {
  const value = Number(calories);
  if (!Number.isFinite(value) || value <= 0 || value > 10000) {
    throw new ValidationError('Calories must be between 1 and 10000');
  }
  return Math.round(value);
}

function validateOptionalNote(note: unknown): string | null {
  if (note === undefined || note === null || note === '') return null;
  return validateString(note, 'Note', 80);
}

export async function POST(req: NextRequest) {
  return handleApi(async () => {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const calories = validateCalories(body.calories);
    const note = validateOptionalNote(body.note);
    const date = body.date ?? new Date().toISOString().split('T')[0];

    const dailyLogId = await getOrCreateDailyLog(session.id, date);

    await client.execute({
      sql: 'INSERT INTO log_entries (daily_log_id, food_id, quantity_grams, note) VALUES (?, ?, ?, ?)',
      args: [dailyLogId, QUICK_LOG_FOOD_ID, calories, note],
    });

    return NextResponse.json({ success: true }, { status: 201 });
  });
}
