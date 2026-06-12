import { NextRequest, NextResponse } from 'next/server';
import client from '@/lib/db';
import { getSession } from '@/lib/auth';
import { handleApi } from '@/lib/api';
import { validateString, validateMacros } from '@/lib/validate';

export async function GET(req: NextRequest) {
  return handleApi(async () => {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q')?.trim() ?? '';

    let result;
    if (query.length > 0) {
      result = await client.execute({
        sql: `SELECT * FROM foods
              WHERE category <> 'system'
                AND ((is_custom = 0 AND name LIKE ?)
                 OR (is_custom = 1 AND created_by = ? AND name LIKE ?)
                )
              ORDER BY is_custom ASC, name ASC`,
        args: [`%${query}%`, session.id, `%${query}%`],
      });
    } else {
      result = await client.execute({
        sql: `SELECT * FROM foods
              WHERE category <> 'system'
                AND (is_custom = 0 OR (is_custom = 1 AND created_by = ?))
              ORDER BY category ASC, name ASC`,
        args: [session.id],
      });
    }

    return NextResponse.json({ foods: result.rows });
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

    const result = await client.execute({
      sql: `INSERT INTO foods (name, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, category, is_custom, created_by)
            VALUES (?, ?, ?, ?, ?, ?, 1, ?)`,
      args: [name, macros.calories_per_100g, macros.protein_per_100g, macros.carbs_per_100g, macros.fat_per_100g, category, session.id],
    });

    return NextResponse.json({ success: true, id: Number(result.lastInsertRowid) }, { status: 201 });
  });
}
