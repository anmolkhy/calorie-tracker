import { NextResponse } from 'next/server';
import { ValidationError } from '@/lib/validate';
import { ensureDB } from '@/lib/db';

type ApiHandler = () => Promise<NextResponse>;

export async function handleApi(fn: ApiHandler): Promise<NextResponse> {
  try {
    await ensureDB();
    return await fn();
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('[API Error]', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}