'use client';
import { useState, useEffect, useRef } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { calculateMacros } from '@/lib/calculate';

interface Food {
  id: number;
  name: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  category: string;
  is_custom: number;
}

interface Props {
  date: string;
  onLogged: () => void;
  onClose: () => void;
}

export default function FoodSearch({ date, onLogged, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [foods, setFoods] = useState<Food[]>([]);
  const [selected, setSelected] = useState<Food | null>(null);
  const [quantity, setQuantity] = useState('100');
  const [logging, setLogging] = useState(false);
  const searchRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    clearTimeout(searchRef.current);
    searchRef.current = setTimeout(async () => {
      const res = await fetch(`/api/foods?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setFoods(data.foods);
      }
    }, 200);
  }, [query]);

  const preview = selected
    ? calculateMacros(selected, Number(quantity) || 0)
    : null;

  const handleLog = async () => {
    if (!selected || !quantity) return;
    setLogging(true);
    await fetch('/api/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        food_id: selected.id,
        quantity_grams: Number(quantity),
        date,
      }),
    });
    setLogging(false);
    onLogged();
  };

  return (
    <div className="card flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Log Food</span>
        <button
          onClick={onClose}
          className="mono text-xs"
          style={{ color: 'var(--text-dim)' }}
        >✕</button>
      </div>

      <Input
        placeholder="Search foods..."
        value={query}
        onChange={e => {
          setQuery(e.target.value);
          setSelected(null);
        }}
        autoFocus
      />

      {/* Food list */}
      {!selected && foods.length > 0 && (
        <div
          className="flex flex-col rounded-lg overflow-hidden"
          style={{ border: '1px solid var(--border)' }}
        >
          {foods.slice(0, 8).map((food, i) => (
            <button
              key={food.id}
              onClick={() => setSelected(food)}
              className="flex items-center justify-between px-4 py-3 text-left transition-colors"
              style={{
                background: 'var(--surface-2)',
                borderTop: i > 0 ? '1px solid var(--border)' : 'none',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--surface-2)')}
            >
              <div>
                <div className="text-sm font-medium">{food.name}</div>
                <div className="mono text-xs mt-0.5" style={{ color: 'var(--text-dim)' }}>
                  {food.calories_per_100g} kcal · {food.protein_per_100g}g P · {food.carbs_per_100g}g C · {food.fat_per_100g}g F
                  <span className="ml-2 text-xs" style={{ color: 'var(--text-dim)' }}>per 100g</span>
                </div>
              </div>
              {food.is_custom === 1 && (
                <span
                  className="text-xs px-1.5 py-0.5 rounded mono"
                  style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}
                >
                  custom
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Selected food + quantity */}
      {selected && (
        <div className="flex flex-col gap-4">
          <div
            className="flex items-center justify-between px-4 py-3 rounded-lg"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
          >
            <div>
              <div className="text-sm font-medium">{selected.name}</div>
              <div className="mono text-xs mt-0.5" style={{ color: 'var(--text-dim)' }}>
                per 100g: {selected.calories_per_100g} kcal
              </div>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="mono text-xs ml-4"
              style={{ color: 'var(--text-dim)' }}
            >✕</button>
          </div>

          <Input
            label="Quantity (grams)"
            type="number"
            value={quantity}
            onChange={e => setQuantity(e.target.value)}
            min="1"
            max="5000"
            autoFocus
          />

          {/* Macro preview */}
          {preview && (
            <div
              className="grid grid-cols-4 gap-2 px-4 py-3 rounded-lg mono text-center"
              style={{ background: 'var(--surface-2)' }}
            >
              {[
                { label: 'kcal', value: Math.round(preview.calories), color: 'var(--calories)' },
                { label: 'protein', value: `${preview.protein.toFixed(1)}g`, color: 'var(--protein)' },
                { label: 'carbs', value: `${preview.carbs.toFixed(1)}g`, color: 'var(--carbs)' },
                { label: 'fat', value: `${preview.fat.toFixed(1)}g`, color: 'var(--fat)' },
              ].map(item => (
                <div key={item.label}>
                  <div className="text-sm font-medium" style={{ color: item.color }}>{item.value}</div>
                  <div className="text-xs" style={{ color: 'var(--text-dim)' }}>{item.label}</div>
                </div>
              ))}
            </div>
          )}

          <Button onClick={handleLog} disabled={logging || !quantity} fullWidth>
            {logging ? 'Logging...' : `Log ${quantity}g of ${selected.name}`}
          </Button>
        </div>
      )}

      {!selected && foods.length === 0 && query.length > 0 && (
        <div className="text-center py-4" style={{ color: 'var(--text-dim)' }}>
          <div className="text-sm">No foods found for "{query}"</div>
          <div className="text-xs mt-1">Try a different name or add a custom food in the Foods tab</div>
        </div>
      )}
    </div>
  );
}