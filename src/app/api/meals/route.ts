import { NextRequest, NextResponse } from 'next/server';
import client from '@/lib/db';
import { getSession } from '@/lib/auth';
import { handleApi } from '@/lib/api';
import { validateString, validateQuantity } from '@/lib/validate';

export async function GET() {
  return handleApi(async () => {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const result = await client.execute({
      sql: `SELECT m.*, COUNT(mi.id) as item_count
            FROM meals m
            LEFT JOIN meal_items mi ON mi.meal_id = m.id
            WHERE m.user_id = ?
            GROUP BY m.id
            ORDER BY m.created_at DESC`,
      args: [session.id],
    });

    return NextResponse.json({ meals: result.rows });
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

    const mealResult = await client.execute({
      sql: 'INSERT INTO meals (user_id, name) VALUES (?, ?)',
      args: [session.id, name],
    });

    const mealId = Number(mealResult.lastInsertRowid);

    for (const item of body.items) {
      const quantity = validateQuantity(item.quantity_grams);
      await client.execute({
        sql: 'INSERT INTO meal_items (meal_id, food_id, quantity_grams) VALUES (?, ?, ?)',
        args: [mealId, Number(item.food_id), quantity],
      });
    }

    return NextResponse.json({ success: true, id: mealId }, { status: 201 });
  });
}