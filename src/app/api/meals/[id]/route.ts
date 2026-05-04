import { NextRequest, NextResponse } from 'next/server';
import client from '@/lib/db';
import { getSession } from '@/lib/auth';
import { handleApi } from '@/lib/api';
import { validateString, validateQuantity } from '@/lib/validate';

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: RouteParams) {
  return handleApi(async () => {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const mealId = Number(id);

    const meal = await client.execute({
      sql: 'SELECT * FROM meals WHERE id = ? AND user_id = ?',
      args: [mealId, session.id],
    });

    if (meal.rows.length === 0) return NextResponse.json({ error: 'Meal not found' }, { status: 404 });

    const items = await client.execute({
      sql: `SELECT mi.*, f.name, f.calories_per_100g, f.protein_per_100g,
                   f.carbs_per_100g, f.fat_per_100g
            FROM meal_items mi
            JOIN foods f ON f.id = mi.food_id
            WHERE mi.meal_id = ?`,
      args: [mealId],
    });

    return NextResponse.json({ meal: meal.rows[0], items: items.rows });
  });
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  return handleApi(async () => {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const mealId = Number(id);

    const meal = await client.execute({
      sql: 'SELECT * FROM meals WHERE id = ? AND user_id = ?',
      args: [mealId, session.id],
    });

    if (meal.rows.length === 0) return NextResponse.json({ error: 'Meal not found' }, { status: 404 });

    const body = await req.json();

    if (body.name) {
      const name = validateString(body.name, 'Meal name');
      await client.execute({
        sql: 'UPDATE meals SET name = ? WHERE id = ?',
        args: [name, mealId],
      });
    }

    if (Array.isArray(body.items) && body.items.length > 0) {
      await client.execute({
        sql: 'DELETE FROM meal_items WHERE meal_id = ?',
        args: [mealId],
      });

      for (const item of body.items) {
        const quantity = validateQuantity(item.quantity_grams);
        await client.execute({
          sql: 'INSERT INTO meal_items (meal_id, food_id, quantity_grams) VALUES (?, ?, ?)',
          args: [mealId, Number(item.food_id), quantity],
        });
      }
    }

    return NextResponse.json({ success: true });
  });
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  return handleApi(async () => {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const mealId = Number(id);

    const meal = await client.execute({
      sql: 'SELECT * FROM meals WHERE id = ? AND user_id = ?',
      args: [mealId, session.id],
    });

    if (meal.rows.length === 0) return NextResponse.json({ error: 'Meal not found' }, { status: 404 });

    await client.execute({ sql: 'DELETE FROM meals WHERE id = ?', args: [mealId] });
    return NextResponse.json({ success: true });
  });
}