import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';

// GET all meals for user
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const meals = db.prepare(`
    SELECT m.*, 
      COUNT(mi.id) as item_count
    FROM meals m
    LEFT JOIN meal_items mi ON mi.meal_id = m.id
    WHERE m.user_id = ?
    GROUP BY m.id
    ORDER BY m.created_at DESC
  `).all(session.id);

  return NextResponse.json({ meals });
}

// POST create a new meal
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name, items } = await req.json();
  // items: [{ food_id, quantity_grams }]

  if (!name) return NextResponse.json({ error: 'Meal name is required' }, { status: 400 });
  if (!items || items.length === 0) return NextResponse.json({ error: 'Meal must have at least one item' }, { status: 400 });

  const createMeal = db.transaction(() => {
    const result = db.prepare(
      'INSERT INTO meals (user_id, name) VALUES (?, ?)'
    ).run(session.id, name);

    const mealId = result.lastInsertRowid;

    const insertItem = db.prepare(
      'INSERT INTO meal_items (meal_id, food_id, quantity_grams) VALUES (?, ?, ?)'
    );

    for (const item of items) {
      insertItem.run(mealId, item.food_id, item.quantity_grams);
    }

    return mealId;
  });

  const mealId = createMeal();
  return NextResponse.json({ success: true, id: mealId }, { status: 201 });
}