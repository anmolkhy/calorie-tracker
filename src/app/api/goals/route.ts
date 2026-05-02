import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';

// GET current goals
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const goals = db.prepare(`
    SELECT * FROM user_goals 
    WHERE user_id = ? 
    ORDER BY effective_from DESC 
    LIMIT 1
  `).get(session.id);

  return NextResponse.json({ goals });
}

// POST set new goals
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { calories, protein, carbs, fat } = await req.json();

  if (!calories || !protein || !carbs || !fat) {
    return NextResponse.json({ error: 'All macro targets are required' }, { status: 400 });
  }

  db.prepare(`
    INSERT INTO user_goals (user_id, calories, protein, carbs, fat)
    VALUES (?, ?, ?, ?, ?)
  `).run(session.id, calories, protein, carbs, fat);

  return NextResponse.json({ success: true });
}