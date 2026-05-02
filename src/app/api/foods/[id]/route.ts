import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';

// PUT - edit a custom food (only own custom foods)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const food = db.prepare('SELECT * FROM foods WHERE id = ?').get(Number(params.id)) as any;

  if (!food) return NextResponse.json({ error: 'Food not found' }, { status: 404 });
  if (!food.is_custom || food.created_by !== session.id) {
    return NextResponse.json({ error: 'Cannot edit this food' }, { status: 403 });
  }

  const { name, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, category } = await req.json();

  db.prepare(`
    UPDATE foods SET name = ?, calories_per_100g = ?, protein_per_100g = ?, 
    carbs_per_100g = ?, fat_per_100g = ?, category = ?
    WHERE id = ?
  `).run(name, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, category, Number(params.id));

  return NextResponse.json({ success: true });
}

// DELETE - delete a custom food
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const food = db.prepare('SELECT * FROM foods WHERE id = ?').get(Number(params.id)) as any;

  if (!food) return NextResponse.json({ error: 'Food not found' }, { status: 404 });
  if (!food.is_custom || food.created_by !== session.id) {
    return NextResponse.json({ error: 'Cannot delete this food' }, { status: 403 });
  }

  db.prepare('DELETE FROM foods WHERE id = ?').run(Number(params.id));

  return NextResponse.json({ success: true });
}