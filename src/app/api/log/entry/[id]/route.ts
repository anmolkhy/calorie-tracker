import { NextRequest, NextResponse } from 'next/server';
import client from '@/lib/db';
import { getSession } from '@/lib/auth';
import { handleApi } from '@/lib/api';

type RouteParams = { params: Promise<{ id: string }> };

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  return handleApi(async () => {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const entryId = Number(id);

    const entry = await client.execute({
      sql: `SELECT le.id FROM log_entries le
            JOIN daily_logs dl ON dl.id = le.daily_log_id
            WHERE le.id = ? AND dl.user_id = ?`,
      args: [entryId, session.id],
    });

    if (entry.rows.length === 0) return NextResponse.json({ error: 'Entry not found' }, { status: 404 });

    await client.execute({ sql: 'DELETE FROM log_entries WHERE id = ?', args: [entryId] });
    return NextResponse.json({ success: true });
  });
}