import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';

// DELETE a single log entry
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Verify entry belongs to this user
  const entry = db.prepare(`
    SELECT le.id FROM log_entries le
    JOIN daily_logs dl ON dl.id = le.daily_log_id
    WHERE le.id = ? AND dl.user_id = ?
  `).get(Number(params.id), session.id);

  if (!entry) return NextResponse.json({ error: 'Entry not found' }, { status: 404 });

  db.prepare('DELETE FROM log_entries WHERE id = ?').run(Number(params.id));

  return NextResponse.json({ success: true });
}