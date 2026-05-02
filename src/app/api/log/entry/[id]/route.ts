import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';
import { handleApi } from '@/lib/api';

type RouteParams = { params: Promise<{ id: string }> };

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  return handleApi(async () => {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const entryId = Number(id);

    const entry = db.prepare(`
      SELECT le.id FROM log_entries le
      JOIN daily_logs dl ON dl.id = le.daily_log_id
      WHERE le.id = ? AND dl.user_id = ?
    `).get(entryId, session.id);

    if (!entry) return NextResponse.json({ error: 'Entry not found' }, { status: 404 });

    db.prepare('DELETE FROM log_entries WHERE id = ?').run(entryId);
    return NextResponse.json({ success: true });
  });
}