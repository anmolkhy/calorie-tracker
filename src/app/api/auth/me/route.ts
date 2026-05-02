import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { handleApi } from '@/lib/api';

export async function GET() {
  return handleApi(async () => {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ user: session });
  });
}