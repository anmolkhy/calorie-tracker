import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import db, { runMigrations } from '@/lib/db';
import { createToken, COOKIE_NAME } from '@/lib/auth';

runMigrations();

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existing = db
      .prepare('SELECT id FROM users WHERE email = ?')
      .get(email);

    if (existing) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    const password_hash = await bcrypt.hash(password, 10);

    const result = db
      .prepare(
        'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)'
      )
      .run(name, email, password_hash);

    const userId = result.lastInsertRowid as number;

    // Set default goals on register
    db.prepare(
      `INSERT INTO user_goals (user_id, calories, protein, carbs, fat)
       VALUES (?, 2000, 150, 200, 65)`
    ).run(userId);

    const token = await createToken({ id: userId, email, name });

    const response = NextResponse.json(
      { success: true, user: { id: userId, email, name } },
      { status: 201 }
    );

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}