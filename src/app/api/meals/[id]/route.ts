import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';
import { handleApi } from '@/lib/api';
import { validateString, validateQuantity } from '@/lib/validate';
import type { Meal, MealItem } from '@/types/db';

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: RouteParams) {
  return handleApi(async () => {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const mealId = Number(id);

    const meal = db.prepare(
      'SELECT * FROM meals WHERE id = ? AND user_id = ?'
    ).get(mealId, session.id) as Meal | undefined;

    if (!meal) return NextResponse.json({ error: 'Meal not found' }, { status: 404 });

    const items = db.prepare(`
      SELECT mi.*, f.name, f.calories_per_100g, f.protein_per_100g,
             f.carbs_per_100g, f.fat_per_100g
      FROM meal_items mi
      JOIN foods f ON f.id = mi.food_id
      WHERE mi.meal_id = ?
    `).all(mealId) as MealItem[];

    return NextResponse.json({ meal, items });
  });
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  return handleApi(async () => {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const mealId = Number(id);

    const meal = db.prepare(
      'SELECT * FROM meals WHERE id = ? AND user_id = ?'
    ).get(mealId, session.id) as Meal | undefined;

    if (!meal) return NextResponse.json({ error: 'Meal not found' }, { status: 404 });

    const body = await req.json();

    db.transaction(() => {
      if (body.name) {
        const name = validateString(body.name, 'Meal name');
        db.prepare('UPDATE meals SET name = ? WHERE id = ?').run(name, mealId);
      }

      if (Array.isArray(body.items) && body.items.length > 0) {
        db.prepare('DELETE FROM meal_items WHERE meal_id = ?').run(mealId);
        const insertItem = db.prepare(
          'INSERT INTO meal_items (meal_id, food_id, quantity_grams) VALUES (?, ?, ?)'
        );
        for (const item of body.items) {
          const quantity = validateQuantity(item.quantity_grams);
          insertItem.run(mealId, Number(item.food_id), quantity);
        }
      }
    })();

    return NextResponse.json({ success: true });
  });
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  return handleApi(async () => {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const mealId = Number(id);

    const meal = db.prepare(
      'SELECT * FROM meals WHERE id = ? AND user_id = ?'
    ).get(mealId, session.id) as Meal | undefined;

    if (!meal) return NextResponse.json({ error: 'Meal not found' }, { status: 404 });

    db.prepare('DELETE FROM meals WHERE id = ?').run(mealId);
    return NextResponse.json({ success: true });
  });
}