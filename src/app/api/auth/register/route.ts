import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import client from '@/lib/db';
import { createToken, COOKIE_NAME } from '@/lib/auth';
import { handleApi } from '@/lib/api';
import { validateString } from '@/lib/validate';

export async function POST(req: NextRequest) {
  return handleApi(async () => {
    const body = await req.json();
    const name = validateString(body.name, 'Name');
    const email = validateString(body.email, 'Email');
    const password = validateString(body.password, 'Password');

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const existing = await client.execute({
      sql: 'SELECT id FROM users WHERE email = ?',
      args: [email],
    });

    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const result = await client.execute({
      sql: 'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      args: [name, email, password_hash],
    });

    const userId = Number(result.lastInsertRowid);

    await client.execute({
      sql: 'INSERT INTO user_goals (user_id, calories, protein, carbs, fat) VALUES (?, 2000, 150, 200, 65)',
      args: [userId],
    });

    const token = await createToken({ id: userId, email, name });

    const response = NextResponse.json(
      { success: true, user: { id: userId, email, name } },
      { status: 201 }
    );

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  });
}