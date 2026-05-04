import { NextRequest, NextResponse } from 'next/server';
import client from '@/lib/db';
import { getSession } from '@/lib/auth';
import { handleApi } from '@/lib/api';

export async function GET() {
  return handleApi(async () => {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const result = await client.execute({
      sql: 'SELECT * FROM user_goals WHERE user_id = ? ORDER BY effective_from DESC LIMIT 1',
      args: [session.id],
    });

    const goals = result.rows[0] ?? null;
    return NextResponse.json({ goals });
  });
}

export async function POST(req: NextRequest) {
  return handleApi(async () => {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const calories = Number(body.calories);
    const protein = Number(body.protein);
    const carbs = Number(body.carbs);
    const fat = Number(body.fat);

    if ([calories, protein, carbs, fat].some(v => isNaN(v) || v < 0)) {
      return NextResponse.json({ error: 'All macro targets must be valid positive numbers' }, { status: 400 });
    }

    await client.execute({
      sql: 'INSERT INTO user_goals (user_id, calories, protein, carbs, fat) VALUES (?, ?, ?, ?, ?)',
      args: [session.id, calories, protein, carbs, fat],
    });

    return NextResponse.json({ success: true });
  });
}