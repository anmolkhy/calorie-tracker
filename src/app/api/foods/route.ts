import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';

// GET - search or list all foods
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q')?.trim() || '';

  let foods;

  if (query.length > 0) {
    foods = db.prepare(`
      SELECT * FROM foods 
      WHERE (name LIKE ? AND is_custom = 0)
         OR (is_custom = 1 AND created_by = ? AND name LIKE ?)
      ORDER BY is_custom ASC, name ASC
    `).all(`%${query}%`, session.id, `%${query}%`);
  } else {
    foods = db.prepare(`
      SELECT * FROM foods 
      WHERE is_custom = 0 
         OR (is_custom = 1 AND created_by = ?)
      ORDER BY category ASC, name ASC
    `).all(session.id);
  }

  return NextResponse.json({ foods });
}

// POST - add custom food
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, category } = await req.json();

  if (!name || calories_per_100g == null || protein_per_100g == null || carbs_per_100g == null || fat_per_100g == null) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
  }

  const result = db.prepare(`
    INSERT INTO foods (name, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, category, is_custom, created_by)
    VALUES (?, ?, ?, ?, ?, ?, 1, ?)
  `).run(name, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, category || 'custom', session.id);

  return NextResponse.json({ success: true, id: result.lastInsertRowid }, { status: 201 });
}