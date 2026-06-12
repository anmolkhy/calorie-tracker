'use client';
import { useState } from 'react';

interface EntryMacros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface LogEntry {
  id: number;
  name: string;
  quantity_grams: number;
  meal_id: number | null;
  meal_name: string | null;
  note: string | null;
  is_quick_log: boolean;
  macros: EntryMacros;
}

interface Props {
  entry: LogEntry;
  onDelete: () => void;
}

export default function LogEntryRow({ entry, onDelete }: Props) {
  const [deleting, setDeleting] = useState(false);
  const displayName = entry.is_quick_log && entry.note ? entry.note : entry.name;

  const handleDelete = async () => {
    setDeleting(true);
    await onDelete();
  };

  return (
    <div
      className="flex items-center justify-between px-4 py-3 rounded-xl transition-opacity"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        opacity: deleting ? 0.4 : 1,
      }}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">{displayName}</span>
          {entry.meal_name && (
            <span
              className="text-xs px-1.5 py-0.5 rounded mono shrink-0"
              style={{ background: 'var(--surface-2)', color: 'var(--text-dim)' }}
            >
              {entry.meal_name}
            </span>
          )}
        </div>
        <div className="mono text-xs mt-1" style={{ color: 'var(--text-dim)' }}>
          {entry.is_quick_log ? (
            <span style={{ color: 'var(--calories)' }}>
              {Math.round(entry.macros.calories)} kcal
            </span>
          ) : (
            <>
              {entry.quantity_grams}g ·{' '}
              <span style={{ color: 'var(--calories)' }}>
                {Math.round(entry.macros.calories)} kcal
              </span>
              {' · '}
              <span style={{ color: 'var(--protein)' }}>{entry.macros.protein.toFixed(1)}g P</span>
              {' · '}
              <span style={{ color: 'var(--carbs)' }}>{entry.macros.carbs.toFixed(1)}g C</span>
              {' · '}
              <span style={{ color: 'var(--fat)' }}>{entry.macros.fat.toFixed(1)}g F</span>
            </>
          )}
        </div>
      </div>

      <button
        onClick={handleDelete}
        disabled={deleting}
        className="ml-3 shrink-0 w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
        style={{ color: 'var(--text-dim)' }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--red)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}
        title="Remove entry"
      >
        ✕
      </button>
    </div>
  );
}
