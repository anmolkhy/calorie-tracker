interface Props {
  label: string;
  consumed: number;
  goal: number;
  color: string;
  unit?: string;
}

export default function MacroBar({ label, consumed, goal, color, unit = 'g' }: Props) {
  const percent = goal > 0 ? Math.min((consumed / goal) * 100, 100) : 0;
  const remaining = Math.max(goal - consumed, 0);
  const over = consumed > goal;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-baseline gap-1">
        <span
          className="text-xs uppercase tracking-wider shrink-0"
          style={{ color: 'var(--text-muted)' }}
        >
          {label}
        </span>
        <span className="mono text-xs font-medium shrink-0" style={{ color }}>
          {consumed.toFixed(1)}{unit}
        </span>
      </div>

      <div className="macro-track">
        <div
          className="macro-fill"
          style={{
            width: `${percent}%`,
            background: over ? 'var(--red)' : color,
          }}
        />
      </div>

      <div className="mono text-xs" style={{ color: 'var(--text-dim)' }}>
        {over
          ? <span style={{ color: 'var(--red)' }}>+{(consumed - goal).toFixed(1)}{unit} over</span>
          : <span>{remaining.toFixed(1)}{unit} left</span>
        }
      </div>
    </div>
  );
}