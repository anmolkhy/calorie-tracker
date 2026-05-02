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
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-baseline">
        <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">{label}</span>
        <div className="flex items-baseline gap-1">
          <span className="mono text-sm font-medium" style={{ color }}>
            {consumed.toFixed(1)}{unit}
          </span>
          <span className="text-xs text-[var(--text-dim)]">/ {goal}{unit}</span>
        </div>
      </div>

      {/* Track */}
      <div className="h-1 bg-[var(--surface-2)] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${percent}%`,
            backgroundColor: over ? 'var(--red)' : color,
          }}
        />
      </div>

      <div className="flex justify-between">
        <span className="text-xs text-[var(--text-dim)]">
          {over
            ? <span className="text-[var(--red)]">+{(consumed - goal).toFixed(1)}{unit} over</span>
            : <span>{remaining.toFixed(1)}{unit} left</span>
          }
        </span>
        <span className="mono text-xs text-[var(--text-dim)]">{Math.round(percent)}%</span>
      </div>
    </div>
  );
}