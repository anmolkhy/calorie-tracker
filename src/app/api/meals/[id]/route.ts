import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';

// GET single meal with all items
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const meal = db.prepare('SELECT * FROM meals WHERE id = ? AND user_id = ?')
    .get(Number(params.id), session.id);

  if (!meal) return NextResponse.json({ error: 'Meal not found' }, { status: 404 });

  const items = db.prepare(`
    SELECT mi.*, f.name, f.calories_per_100g, f.protein_per_100g, 
           f.carbs_per_100g, f.fat_per_100g
    FROM meal_items mi
    JOIN foods f ON f.id = mi.food_id
    WHERE mi.meal_id = ?
  `).all(Number(params.id));

  return NextResponse.json({ meal, items });
}

// PUT update meal name and items
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const meal = db.prepare('SELECT * FROM meals WHERE id = ? AND user_id = ?')
    .get(Number(params.id), session.id);

  if (!meal) return NextResponse.json({ error: 'Meal not found' }, { status: 404 });

  const { name, items } = await req.json();

  const updateMeal = db.transaction(() => {
    if (name) {
      db.prepare('UPDATE meals SET name = ? WHERE id = ?').run(name, Number(params.id));
    }

    if (items && items.length > 0) {
      // Delete existing items and replace
      db.prepare('DELETE FROM meal_items WHERE meal_id = ?').run(Number(params.id));

      const insertItem = db.prepare(
        'INSERT INTO meal_items (meal_id, food_id, quantity_grams) VALUES (?, ?, ?)'
      );
      for (const item of items) {
        insertItem.run(Number(params.id), item.food_id, item.quantity_grams);
      }
    }
  });

  updateMeal();
  return NextResponse.json({ success: true });
}

// DELETE meal
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const meal = db.prepare('SELECT * FROM meals WHERE id = ? AND user_id = ?')
    .get(Number(params.id), session.id);

  if (!meal) return NextResponse.json({ error: 'Meal not found' }, { status: 404 });

  db.prepare('DELETE FROM meals WHERE id = ?').run(Number(params.id));

  return NextResponse.json({ success: true });
}