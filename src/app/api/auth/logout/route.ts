import { NextResponse } from 'next/server';
import { COOKIE_NAME } from '@/lib/auth';
import { handleApi } from '@/lib/api';

export async function POST() {
  return handleApi(async () => {
    const response = NextResponse.json({ success: true });
    response.cookies.delete(COOKIE_NAME);
    return response;
  });
}