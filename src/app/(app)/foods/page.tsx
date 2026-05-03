'use client';
import { useState, useEffect } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

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

const EMPTY_FORM = {
  name: '',
  calories_per_100g: '',
  protein_per_100g: '',
  carbs_per_100g: '',
  fat_per_100g: '',
  category: 'custom',
};

const CATEGORIES = [
  'all', 'grains', 'legumes', 'dairy', 'protein',
  'vegetables', 'fruits', 'oils', 'nuts', 'custom'
];

export default function FoodsPage() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchFoods = async (q = '') => {
    setLoading(true);
    const res = await fetch(`/api/foods?q=${encodeURIComponent(q)}`);
    if (res.ok) {
      const data = await res.json();
      setFoods(data.foods ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    const timeout = setTimeout(() => fetchFoods(query), 200);
    return () => clearTimeout(timeout);
  }, [query]);

  const filtered = category === 'all'
    ? foods
    : foods.filter(f => f.category === category);

  const handleSave = async () => {
    setSaving(true);
    setError('');

    const url = editingId ? `/api/foods/${editingId}` : '/api/foods';
    const method = editingId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        calories_per_100g: Number(form.calories_per_100g),
        protein_per_100g: Number(form.protein_per_100g),
        carbs_per_100g: Number(form.carbs_per_100g),
        fat_per_100g: Number(form.fat_per_100g),
        category: form.category,
      }),
    });

    if (res.ok) {
      setForm(EMPTY_FORM);
      setShowAdd(false);
      setEditingId(null);
      fetchFoods(query);
    } else {
      const d = await res.json();
      setError(d.error ?? 'Failed to save');
    }
    setSaving(false);
  };

  const handleEdit = (food: Food) => {
    setForm({
      name: food.name,
      calories_per_100g: String(food.calories_per_100g),
      protein_per_100g: String(food.protein_per_100g),
      carbs_per_100g: String(food.carbs_per_100g),
      fat_per_100g: String(food.fat_per_100g),
      category: food.category,
    });
    setEditingId(food.id);
    setShowAdd(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this food?')) return;
    await fetch(`/api/foods/${id}`, { method: 'DELETE' });
    fetchFoods(query);
  };

  const handleCancel = () => {
    setForm(EMPTY_FORM);
    setShowAdd(false);
    setEditingId(null);
    setError('');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-6 fade-up">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Foods</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {foods.length} foods in database
          </p>
        </div>
        {!showAdd && (
          <Button onClick={() => setShowAdd(true)} size="sm">
            + Add Food
          </Button>
        )}
      </div>

      {/* Add / Edit form */}
      {showAdd && (
        <div className="card flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {editingId ? 'Edit Food' : 'Add Custom Food'}
            </span>
            <button
              onClick={handleCancel}
              className="mono text-xs"
              style={{ color: 'var(--text-dim)' }}
            >✕</button>
          </div>

          <Input
            label="Food Name"
            placeholder="e.g. Oats (raw)"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          />

          <div className="flex flex-col gap-1.5">
            <label className="input-label">Category</label>
            <select
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="input-field"
            >
              {CATEGORIES.filter(c => c !== 'all').map(c => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Calories (per 100g)"
              type="number"
              placeholder="0"
              value={form.calories_per_100g}
              onChange={e => setForm(f => ({ ...f, calories_per_100g: e.target.value }))}
              min="0"
            />
            <Input
              label="Protein (per 100g)"
              type="number"
              placeholder="0"
              value={form.protein_per_100g}
              onChange={e => setForm(f => ({ ...f, protein_per_100g: e.target.value }))}
              min="0"
            />
            <Input
              label="Carbs (per 100g)"
              type="number"
              placeholder="0"
              value={form.carbs_per_100g}
              onChange={e => setForm(f => ({ ...f, carbs_per_100g: e.target.value }))}
              min="0"
            />
            <Input
              label="Fat (per 100g)"
              type="number"
              placeholder="0"
              value={form.fat_per_100g}
              onChange={e => setForm(f => ({ ...f, fat_per_100g: e.target.value }))}
              min="0"
            />
          </div>

          {error && <div className="error-msg">{error}</div>}

          <div className="flex gap-3">
            <Button onClick={handleCancel} variant="ghost" className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="flex-1">
              {saving ? 'Saving...' : editingId ? 'Update Food' : 'Add Food'}
            </Button>
          </div>
        </div>
      )}

      {/* Search */}
      <Input
        placeholder="Search foods..."
        value={query}
        onChange={e => setQuery(e.target.value)}
      />

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className="mono text-xs px-3 py-1.5 rounded-full shrink-0 transition-colors"
            style={{
              background: category === cat ? 'var(--accent)' : 'var(--surface)',
              color: category === cat ? '#000' : 'var(--text-muted)',
              border: `1px solid ${category === cat ? 'var(--accent)' : 'var(--border)'}`,
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Food list */}
      {loading ? (
        <div className="mono text-sm text-center py-8" style={{ color: 'var(--text-dim)' }}>
          Loading...
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="rounded-xl py-10 text-center"
          style={{ border: '1px dashed var(--border)' }}
        >
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>No foods found</div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-dim)' }}>
            Try a different search or category
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map(food => (
            <div
              key={food.id}
              className="px-4 py-3 rounded-xl"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{food.name}</span>
                    {food.is_custom === 1 && (
                      <span
                        className="mono text-xs px-1.5 py-0.5 rounded shrink-0"
                        style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}
                      >
                        custom
                      </span>
                    )}
                  </div>
                  <div className="mono text-xs mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
                    <span style={{ color: 'var(--calories)' }}>
                      {food.calories_per_100g} kcal
                    </span>
                    <span style={{ color: 'var(--protein)' }}>
                      P {food.protein_per_100g}g
                    </span>
                    <span style={{ color: 'var(--carbs)' }}>
                      C {food.carbs_per_100g}g
                    </span>
                    <span style={{ color: 'var(--fat)' }}>
                      F {food.fat_per_100g}g
                    </span>
                    <span style={{ color: 'var(--text-dim)' }}>per 100g</span>
                  </div>
                </div>

                {/* Actions — only for custom foods */}
                {food.is_custom === 1 && (
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleEdit(food)}
                      className="mono text-xs px-2 py-1 rounded transition-colors"
                      style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-hover)')}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                    >
                      edit
                    </button>
                    <button
                      onClick={() => handleDelete(food.id)}
                      className="mono text-xs px-2 py-1 rounded transition-colors"
                      style={{ color: 'var(--text-dim)', border: '1px solid var(--border)' }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--red)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}
                    >
                      del
                    </button>
                  </div>
                )}
              </div>

              {/* Category tag */}
              <div className="mt-2">
                <span
                  className="mono text-xs px-2 py-0.5 rounded-full"
                  style={{ background: 'var(--surface-2)', color: 'var(--text-dim)' }}
                >
                  {food.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}