import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import client from '@/lib/db';
import { createToken, COOKIE_NAME } from '@/lib/auth';
import { handleApi } from '@/lib/api';
import { validateString } from '@/lib/validate';

export async function POST(req: NextRequest) {
  return handleApi(async () => {
    const body = await req.json();
    const email = validateString(body.email, 'Email');
    const password = validateString(body.password, 'Password');

    const result = await client.execute({
      sql: 'SELECT * FROM users WHERE email = ?',
      args: [email],
    });

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash as string);

    if (!valid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const token = await createToken({
      id: Number(user.id),
      email: user.email as string,
      name: user.name as string,
    });

    const response = NextResponse.json({
      success: true,
      user: { id: Number(user.id), email: user.email, name: user.name },
    });

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