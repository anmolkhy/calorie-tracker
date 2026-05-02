import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';
import { handleApi } from '@/lib/api';
import { validateString, validateMacros } from '@/lib/validate';
import type { Food } from '@/types/db';

export async function GET(req: NextRequest) {
  return handleApi(async () => {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q')?.trim() ?? '';

    let foods: Food[];

    if (query.length > 0) {
      foods = db.prepare(`
        SELECT * FROM foods
        WHERE (is_custom = 0 AND name LIKE ?)
           OR (is_custom = 1 AND created_by = ? AND name LIKE ?)
        ORDER BY is_custom ASC, name ASC
      `).all(`%${query}%`, session.id, `%${query}%`) as Food[];
    } else {
      foods = db.prepare(`
        SELECT * FROM foods
        WHERE is_custom = 0 OR (is_custom = 1 AND created_by = ?)
        ORDER BY category ASC, name ASC
      `).all(session.id) as Food[];
    }

    return NextResponse.json({ foods });
  });
}

export async function POST(req: NextRequest) {
  return handleApi(async () => {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const name = validateString(body.name, 'Name');
    const category = body.category ? validateString(body.category, 'Category') : 'custom';

    const macros = {
      calories_per_100g: Number(body.calories_per_100g),
      protein_per_100g: Number(body.protein_per_100g),
      carbs_per_100g: Number(body.carbs_per_100g),
      fat_per_100g: Number(body.fat_per_100g),
    };
    validateMacros(macros);

    const result = db.prepare(`
      INSERT INTO foods (name, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, category, is_custom, created_by)
      VALUES (?, ?, ?, ?, ?, ?, 1, ?)
    `).run(name, macros.calories_per_100g, macros.protein_per_100g, macros.carbs_per_100g, macros.fat_per_100g, category, session.id);

    return NextResponse.json({ success: true, id: result.lastInsertRowid }, { status: 201 });
  });
}