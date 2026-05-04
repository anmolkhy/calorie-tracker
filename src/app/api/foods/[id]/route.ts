import { NextRequest, NextResponse } from 'next/server';
import client from '@/lib/db';
import { getSession } from '@/lib/auth';
import { handleApi } from '@/lib/api';
import { validateString, validateMacros } from '@/lib/validate';

type RouteParams = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: RouteParams) {
  return handleApi(async () => {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const foodId = Number(id);

    const existing = await client.execute({
      sql: 'SELECT * FROM foods WHERE id = ?',
      args: [foodId],
    });

    if (existing.rows.length === 0) return NextResponse.json({ error: 'Food not found' }, { status: 404 });
    const food = existing.rows[0];
    if (!food.is_custom || Number(food.created_by) !== session.id) {
      return NextResponse.json({ error: 'Cannot edit this food' }, { status: 403 });
    }

    const body = await req.json();
    const name = validateString(body.name, 'Name');
    const category = body.category ? validateString(body.category, 'Category') : food.category as string;
    const macros = {
      calories_per_100g: Number(body.calories_per_100g),
      protein_per_100g: Number(body.protein_per_100g),
      carbs_per_100g: Number(body.carbs_per_100g),
      fat_per_100g: Number(body.fat_per_100g),
    };
    validateMacros(macros);

    await client.execute({
      sql: `UPDATE foods SET name = ?, calories_per_100g = ?, protein_per_100g = ?,
            carbs_per_100g = ?, fat_per_100g = ?, category = ? WHERE id = ?`,
      args: [name, macros.calories_per_100g, macros.protein_per_100g, macros.carbs_per_100g, macros.fat_per_100g, category, foodId],
    });

    return NextResponse.json({ success: true });
  });
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  return handleApi(async () => {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const foodId = Number(id);

    const existing = await client.execute({
      sql: 'SELECT * FROM foods WHERE id = ?',
      args: [foodId],
    });

    if (existing.rows.length === 0) return NextResponse.json({ error: 'Food not found' }, { status: 404 });
    const food = existing.rows[0];
    if (!food.is_custom || Number(food.created_by) !== session.id) {
      return NextResponse.json({ error: 'Cannot delete this food' }, { status: 403 });
    }

    await client.execute({ sql: 'DELETE FROM foods WHERE id = ?', args: [foodId] });
    return NextResponse.json({ success: true });
  });
}