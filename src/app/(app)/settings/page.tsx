'use client';
import { useState, useEffect } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface Goals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export default function SettingsPage() {
  const [goals, setGoals] = useState<Goals>({ calories: 2000, protein: 150, carbs: 200, fat: 65 });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/goals')
      .then(r => r.json())
      .then(d => {
        if (d.goals) setGoals({
          calories: d.goals.calories,
          protein: d.goals.protein,
          carbs: d.goals.carbs,
          fat: d.goals.fat,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSaved(false);

    const res = await fetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(goals),
    });

    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      const d = await res.json();
      setError(d.error ?? 'Failed to save');
    }
    setSaving(false);
  };

  const updateGoal = (key: keyof Goals, value: string) => {
    setGoals(g => ({ ...g, [key]: Number(value) }));
  };

  // Calculate implied calories from macros
  const impliedCalories = Math.round(goals.protein * 4 + goals.carbs * 4 + goals.fat * 9);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="mono text-sm" style={{ color: 'var(--text-dim)' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-6 fade-up">

      <div>
        <h1 className="text-xl font-semibold">Daily Goals</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Set your daily calorie and macro targets
        </p>
      </div>

      {/* Calorie target */}
      <div className="card flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Calories</span>
          <span className="mono text-xs" style={{ color: 'var(--text-dim)' }}>kcal / day</span>
        </div>

        <Input
          type="number"
          value={goals.calories}
          onChange={e => updateGoal('calories', e.target.value)}
          min="500"
          max="10000"
        />

        {/* Implied calories hint */}
        <div
          className="flex items-center justify-between px-3 py-2.5 rounded-lg mono text-xs"
          style={{ background: 'var(--surface-2)', color: 'var(--text-dim)' }}
        >
          <span>Implied from macros below</span>
          <span
            style={{ color: impliedCalories === goals.calories ? 'var(--accent)' : 'var(--orange)' }}
          >
            {impliedCalories} kcal
          </span>
        </div>

        <p className="text-xs" style={{ color: 'var(--text-dim)' }}>
          Protein & carbs = 4 kcal/g · Fat = 9 kcal/g. Ideally your calorie goal matches the implied value.
        </p>
      </div>

      {/* Macro targets */}
      <div className="card flex flex-col gap-5">
        <span className="text-sm font-medium">Macros</span>

        {[
          { key: 'protein' as const, label: 'Protein', color: 'var(--protein)', kcalPer: 4 },
          { key: 'carbs' as const, label: 'Carbohydrates', color: 'var(--carbs)', kcalPer: 4 },
          { key: 'fat' as const, label: 'Fat', color: 'var(--fat)', kcalPer: 9 },
        ].map(({ key, label, color, kcalPer }) => (
          <div key={key} className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium" style={{ color }}>{label}</span>
              <div className="mono text-xs" style={{ color: 'var(--text-dim)' }}>
                {Math.round(goals[key] * kcalPer)} kcal
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                value={goals[key]}
                onChange={e => updateGoal(key, e.target.value)}
                min="0"
                max="1000"
                className="flex-1"
              />
              <span className="mono text-sm shrink-0" style={{ color: 'var(--text-dim)' }}>g</span>
            </div>
          </div>
        ))}
      </div>

      {/* Macro split visualization */}
      <div className="card flex flex-col gap-3">
        <span className="text-sm font-medium">Macro Split</span>
        <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
          {[
            { key: 'protein', color: 'var(--protein)', kcal: goals.protein * 4 },
            { key: 'carbs', color: 'var(--carbs)', kcal: goals.carbs * 4 },
            { key: 'fat', color: 'var(--fat)', kcal: goals.fat * 9 },
          ].map(({ key, color, kcal }) => (
            <div
              key={key}
              style={{
                flex: kcal,
                background: color,
                minWidth: kcal > 0 ? '4px' : '0',
              }}
            />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2 mono text-xs text-center">
          {[
            { label: 'Protein', value: goals.protein * 4, color: 'var(--protein)' },
            { label: 'Carbs', value: goals.carbs * 4, color: 'var(--carbs)' },
            { label: 'Fat', value: goals.fat * 9, color: 'var(--fat)' },
          ].map(({ label, value, color }) => (
            <div key={label}>
              <div style={{ color }}>
                {impliedCalories > 0 ? Math.round((value / impliedCalories) * 100) : 0}%
              </div>
              <div style={{ color: 'var(--text-dim)' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {saved && (
        <div
          className="px-4 py-3 rounded-lg text-sm mono"
          style={{ background: 'var(--accent-subtle)', color: 'var(--accent)', border: '1px solid var(--accent-dim)' }}
        >
          ✓ Goals saved successfully
        </div>
      )}

      <Button onClick={handleSave} disabled={saving} fullWidth>
        {saving ? 'Saving...' : 'Save Goals'}
      </Button>
    </div>
  );
}