'use client';
import { useState } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface Props {
  date: string;
  onLogged: () => void;
  onClose: () => void;
}

export default function QuickLog({ date, onLogged, onClose }: Props) {
  const [calories, setCalories] = useState('');
  const [note, setNote] = useState('');
  const [logging, setLogging] = useState(false);
  const [error, setError] = useState('');

  const calorieValue = Number(calories);
  const canSubmit = Number.isFinite(calorieValue) && calorieValue > 0 && calorieValue <= 10000;

  const handleLog = async () => {
    if (!canSubmit) {
      setError('Enter calories between 1 and 10000');
      return;
    }

    setLogging(true);
    setError('');

    const res = await fetch('/api/log/quick', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        calories: calorieValue,
        note: note.trim() || undefined,
        date,
      }),
    });

    setLogging(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: 'Unable to log calories right now' }));
      setError(data.error ?? 'Unable to log calories right now');
      return;
    }

    onLogged();
  };

  return (
    <div className="card flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Quick Log</span>
        <button
          onClick={onClose}
          className="mono text-xs"
          style={{ color: 'var(--text-dim)' }}
        >
          x
        </button>
      </div>

      <Input
        label="Calories"
        type="number"
        inputMode="numeric"
        min="1"
        max="10000"
        placeholder="650"
        value={calories}
        onChange={e => {
          setCalories(e.target.value);
          setError('');
        }}
        error={error}
        autoFocus
      />

      <Input
        label="Note"
        maxLength={80}
        placeholder="Restaurant lunch"
        value={note}
        onChange={e => setNote(e.target.value)}
      />

      <Button onClick={handleLog} disabled={logging || !calories} fullWidth>
        {logging ? 'Logging...' : 'Log Calories'}
      </Button>
    </div>
  );
}
