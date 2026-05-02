import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';
import { handleApi } from '@/lib/api';
import { validateString, validateQuantity } from '@/lib/validate';
import type { Meal } from '@/types/db';

export async function GET() {
  return handleApi(async () => {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const meals = db.prepare(`
      SELECT m.*, COUNT(mi.id) as item_count
      FROM meals m
      LEFT JOIN meal_items mi ON mi.meal_id = m.id
      WHERE m.user_id = ?
      GROUP BY m.id
      ORDER BY m.created_at DESC
    `).all(session.id) as Meal[];

    return NextResponse.json({ meals });
  });
}

export async function POST(req: NextRequest) {
  return handleApi(async () => {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const name = validateString(body.name, 'Meal name');

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: 'Meal must have at least one item' }, { status: 400 });
    }

    const mealId = db.transaction(() => {
      const result = db.prepare(
        'INSERT INTO meals (user_id, name) VALUES (?, ?)'
      ).run(session.id, name);

      const mealId = result.lastInsertRowid;
      const insertItem = db.prepare(
        'INSERT INTO meal_items (meal_id, food_id, quantity_grams) VALUES (?, ?, ?)'
      );

      for (const item of body.items) {
        const quantity = validateQuantity(item.quantity_grams);
        insertItem.run(mealId, Number(item.food_id), quantity);
      }

      return mealId;
    })();

    return NextResponse.json({ success: true, id: mealId }, { status: 201 });
  });
}