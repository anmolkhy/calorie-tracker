'use client';
import { useState, useEffect, useCallback } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { calculateMacros, sumMacros } from '@/lib/calculate';

interface Food {
  id: number;
  name: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  category: string;
}

interface MealItem {
  food_id: number;
  quantity_grams: number;
  name: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
}

interface Meal {
  id: number;
  name: string;
  item_count: number;
}

type EditorItem = {
  food_id: number;
  name: string;
  quantity_grams: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
};

export default function MealsPage() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [mealItems, setMealItems] = useState<Record<number, MealItem[]>>({});
  const [showEditor, setShowEditor] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [mealName, setMealName] = useState('');
  const [editorItems, setEditorItems] = useState<EditorItem[]>([]);
  const [foodQuery, setFoodQuery] = useState('');
  const [foodResults, setFoodResults] = useState<Food[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchMeals = useCallback(async () => {
    const res = await fetch('/api/meals');
    if (res.ok) {
      const data = await res.json();
      setMeals(data.meals ?? []);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMeals();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchMeals]);

  useEffect(() => {
    if (!foodQuery.trim()) {
      const timer = setTimeout(() => {
        setFoodResults([]);
      }, 0);
      return () => clearTimeout(timer);
    }
    const t = setTimeout(async () => {
      const res = await fetch(`/api/foods?q=${encodeURIComponent(foodQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setFoodResults(data.foods ?? []);
      }
    }, 200);
    return () => clearTimeout(t);
  }, [foodQuery]);

  const loadMealItems = async (mealId: number) => {
    if (mealItems[mealId]) return;
    const res = await fetch(`/api/meals/${mealId}`);
    if (res.ok) {
      const data = await res.json();
      setMealItems(prev => ({ ...prev, [mealId]: data.items ?? [] }));
    }
  };

  const toggleExpand = async (mealId: number) => {
    if (expanded === mealId) {
      setExpanded(null);
    } else {
      setExpanded(mealId);
      await loadMealItems(mealId);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setMealName('');
    setEditorItems([]);
    setError('');
    setShowEditor(true);
  };

  const openEdit = async (meal: Meal) => {
    setEditingId(meal.id);
    setMealName(meal.name);
    setError('');

    const res = await fetch(`/api/meals/${meal.id}`);
    if (res.ok) {
      const data = await res.json();
      setEditorItems((data.items ?? []).map((item: MealItem) => ({
        food_id: item.food_id,
        name: item.name,
        quantity_grams: String(item.quantity_grams),
        calories_per_100g: item.calories_per_100g,
        protein_per_100g: item.protein_per_100g,
        carbs_per_100g: item.carbs_per_100g,
        fat_per_100g: item.fat_per_100g,
      })));
    }
    setShowEditor(true);
  };

  const addFoodToMeal = (food: Food) => {
    setEditorItems(prev => [...prev, {
      food_id: food.id,
      name: food.name,
      quantity_grams: '100',
      calories_per_100g: food.calories_per_100g,
      protein_per_100g: food.protein_per_100g,
      carbs_per_100g: food.carbs_per_100g,
      fat_per_100g: food.fat_per_100g,
    }]);
    setFoodQuery('');
    setFoodResults([]);
  };

  const updateItemQuantity = (index: number, value: string) => {
    setEditorItems(prev => prev.map((item, i) =>
      i === index ? { ...item, quantity_grams: value } : item
    ));
  };

  const removeItem = (index: number) => {
    setEditorItems(prev => prev.filter((_, i) => i !== index));
  };

  const getMealTotals = (items: EditorItem[]) => {
    return sumMacros(items.map(item =>
      calculateMacros({
        calories_per_100g: item.calories_per_100g,
        protein_per_100g: item.protein_per_100g,
        carbs_per_100g: item.carbs_per_100g,
        fat_per_100g: item.fat_per_100g,
      }, Number(item.quantity_grams) || 0)
    ));
  };

  const getSavedMealTotals = (items: MealItem[]) => {
    return sumMacros(items.map(item =>
      calculateMacros({
        calories_per_100g: item.calories_per_100g,
        protein_per_100g: item.protein_per_100g,
        carbs_per_100g: item.carbs_per_100g,
        fat_per_100g: item.fat_per_100g,
      }, item.quantity_grams)
    ));
  };

  const handleSave = async () => {
    if (!mealName.trim()) { setError('Meal name is required'); return; }
    if (editorItems.length === 0) { setError('Add at least one food item'); return; }

    setSaving(true);
    setError('');

    const payload = {
      name: mealName.trim(),
      items: editorItems.map(item => ({
        food_id: item.food_id,
        quantity_grams: Number(item.quantity_grams) || 100,
      })),
    };

    const url = editingId ? `/api/meals/${editingId}` : '/api/meals';
    const method = editingId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setShowEditor(false);
      setEditingId(null);
      setMealName('');
      setEditorItems([]);
      // Clear cached items so they reload fresh
      if (editingId) {
        setMealItems(prev => {
          const next = { ...prev };
          delete next[editingId];
          return next;
        });
      }
      fetchMeals();
    } else {
      const d = await res.json();
      setError(d.error ?? 'Failed to save');
    }
    setSaving(false);
  };

  const handleDelete = async (mealId: number) => {
    if (!confirm('Delete this meal?')) return;
    await fetch(`/api/meals/${mealId}`, { method: 'DELETE' });
    fetchMeals();
  };

  const editorTotals = getMealTotals(editorItems);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-6 fade-up">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold">Meals</h1>
          <p
            className="text-sm mt-0.5 truncate"
            style={{ color: "var(--text-muted)" }}
          >
            Reusable meal templates
          </p>
        </div>
        {!showEditor && (
          <Button onClick={openCreate} size="sm" className="shrink-0">
            + New Meal
          </Button>
        )}
      </div>

      {/* Meal Editor */}
      {showEditor && (
        <div className="card flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {editingId ? "Edit Meal" : "New Meal"}
            </span>
            <button
              onClick={() => {
                setShowEditor(false);
                setEditingId(null);
              }}
              className="mono text-xs"
              style={{ color: "var(--text-dim)" }}
            >
              ✕
            </button>
          </div>

          <Input
            label="Meal Name"
            placeholder="e.g. Oats Breakfast"
            value={mealName}
            onChange={(e) => setMealName(e.target.value)}
            autoFocus
          />

          {/* Food search */}
          <div className="flex flex-col gap-2">
            <label className="input-label">Add Ingredients</label>
            <Input
              placeholder="Search and add foods..."
              value={foodQuery}
              onChange={(e) => setFoodQuery(e.target.value)}
            />

            {foodResults.length > 0 && (
              <div
                className="rounded-lg overflow-hidden"
                style={{ border: "1px solid var(--border)" }}
              >
                {foodResults.slice(0, 6).map((food, i) => (
                  <button
                    key={food.id}
                    onClick={() => addFoodToMeal(food)}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors"
                    style={{
                      background: "var(--surface-2)",
                      borderTop: i > 0 ? "1px solid var(--border)" : "none",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "var(--surface)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "var(--surface-2)")
                    }
                  >
                    <span className="text-sm">{food.name}</span>
                    <span
                      className="mono text-xs"
                      style={{ color: "var(--text-dim)" }}
                    >
                      {food.calories_per_100g} kcal/100g
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Editor items */}
          {editorItems.length > 0 && (
            <div className="flex flex-col gap-2">
              <label className="input-label">
                Ingredients ({editorItems.length})
              </label>
              {editorItems.map((item, index) => {
                const macros = calculateMacros(
                  {
                    calories_per_100g: item.calories_per_100g,
                    protein_per_100g: item.protein_per_100g,
                    carbs_per_100g: item.carbs_per_100g,
                    fat_per_100g: item.fat_per_100g,
                  },
                  Number(item.quantity_grams) || 0,
                );

                return (
                  <div
                    key={index}
                    className="px-4 py-3 rounded-lg flex flex-col gap-2"
                    style={{
                      background: "var(--surface-2)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium flex-1 truncate">
                        {item.name}
                      </span>
                      <button
                        onClick={() => removeItem(index)}
                        className="mono text-xs shrink-0"
                        style={{ color: "var(--text-dim)" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.color = "var(--red)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.color = "var(--text-dim)")
                        }
                      >
                        ✕
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        value={item.quantity_grams}
                        onChange={(e) =>
                          updateItemQuantity(index, e.target.value)
                        }
                        className="input-field"
                        style={{ width: "90px" }}
                        min="1"
                        max="5000"
                      />
                      <span
                        className="mono text-xs"
                        style={{ color: "var(--text-dim)" }}
                      >
                        g
                      </span>
                      <span
                        className="mono text-xs ml-auto"
                        style={{ color: "var(--calories)" }}
                      >
                        {Math.round(macros.calories)} kcal
                      </span>
                      <span
                        className="mono text-xs"
                        style={{ color: "var(--protein)" }}
                      >
                        {macros.protein.toFixed(1)}g P
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Meal total preview */}
              <div
                className="px-4 py-3 rounded-lg mono text-xs"
                style={{
                  background: "var(--accent-subtle)",
                  border: "1px solid var(--accent-dim)",
                }}
              >
                <div className="flex items-center justify-between">
                  <span style={{ color: "var(--accent)" }}>Meal Total</span>
                  <div className="flex gap-3">
                    <span style={{ color: "var(--calories)" }}>
                      {Math.round(editorTotals.calories)} kcal
                    </span>
                    <span style={{ color: "var(--protein)" }}>
                      {editorTotals.protein.toFixed(1)}g P
                    </span>
                    <span style={{ color: "var(--carbs)" }}>
                      {editorTotals.carbs.toFixed(1)}g C
                    </span>
                    <span style={{ color: "var(--fat)" }}>
                      {editorTotals.fat.toFixed(1)}g F
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && <div className="error-msg">{error}</div>}

          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={() => {
                setShowEditor(false);
                setEditingId(null);
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="flex-1">
              {saving ? "Saving..." : editingId ? "Update Meal" : "Save Meal"}
            </Button>
          </div>
        </div>
      )}

      {/* Meals list */}
      {meals.length === 0 ? (
        <div
          className="rounded-xl py-12 text-center"
          style={{ border: "1px dashed var(--border)" }}
        >
          <div className="text-2xl mb-2">◈</div>
          <div className="text-sm" style={{ color: "var(--text-muted)" }}>
            No meals yet
          </div>
          <div className="text-xs mt-1" style={{ color: "var(--text-dim)" }}>
            Create a meal template to log multiple foods at once
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {meals.map((meal) => {
            const items = mealItems[meal.id];
            const totals = items ? getSavedMealTotals(items) : null;

            return (
              <div
                key={meal.id}
                className="rounded-xl overflow-hidden"
                style={{ border: "1px solid var(--border)" }}
              >
                {/* Meal header */}
                <div
                  className="flex items-center justify-between px-4 py-3.5"
                  style={{ background: "var(--surface)" }}
                >
                  <button
                    onClick={() => toggleExpand(meal.id)}
                    className="flex-1 text-left"
                  >
                    <div className="text-sm font-medium">{meal.name}</div>
                    <div
                      className="mono text-xs mt-0.5"
                      style={{ color: "var(--text-dim)" }}
                    >
                      {meal.item_count}{" "}
                      {meal.item_count === 1 ? "ingredient" : "ingredients"}
                      {totals && (
                        <>
                          <span style={{ color: "var(--calories)" }}>
                            {" "}
                            · {Math.round(totals.calories)} kcal
                          </span>
                          <span> · {totals.protein.toFixed(1)}g P</span>
                        </>
                      )}
                    </div>
                  </button>

                  <div className="flex items-center gap-2 ml-3 shrink-0">
                    <button
                      onClick={() => openEdit(meal)}
                      className="mono text-xs px-2.5 py-1.5 rounded transition-colors"
                      style={{
                        color: "var(--text-muted)",
                        border: "1px solid var(--border)",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.borderColor =
                          "var(--border-hover)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.borderColor = "var(--border)")
                      }
                    >
                      edit
                    </button>
                    <button
                      onClick={() => handleDelete(meal.id)}
                      className="mono text-xs px-2.5 py-1.5 rounded transition-colors"
                      style={{
                        color: "var(--text-dim)",
                        border: "1px solid var(--border)",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "var(--red)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "var(--text-dim)")
                      }
                    >
                      del
                    </button>
                  </div>
                </div>

                {/* Expanded items */}
                {expanded === meal.id && (
                  <div style={{ borderTop: "1px solid var(--border)" }}>
                    {items ? (
                      items.map((item, i) => {
                        const m = calculateMacros(
                          {
                            calories_per_100g: item.calories_per_100g,
                            protein_per_100g: item.protein_per_100g,
                            carbs_per_100g: item.carbs_per_100g,
                            fat_per_100g: item.fat_per_100g,
                          },
                          item.quantity_grams,
                        );

                        return (
                          <div
                            key={i}
                            className="flex items-center justify-between px-4 py-3 gap-3"
                            style={{
                              background: "var(--surface-2)",
                              borderTop:
                                i > 0 ? "1px solid var(--border)" : "none",
                            }}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-medium truncate">
                                {item.name}
                              </div>
                              <div
                                className="mono text-xs mt-0.5"
                                style={{ color: "var(--text-dim)" }}
                              >
                                {item.quantity_grams}g
                              </div>
                            </div>
                            <div className="mono text-xs shrink-0 text-right flex gap-3">
                              <span style={{ color: "var(--calories)" }}>
                                {Math.round(m.calories)} kcal
                              </span>
                              <span style={{ color: "var(--protein)" }}>
                                {m.protein.toFixed(1)}g P
                              </span>
                              <span style={{ color: "var(--carbs)" }}>
                                {m.carbs.toFixed(1)}g C
                              </span>
                              <span style={{ color: "var(--fat)" }}>
                                {m.fat.toFixed(1)}g F
                              </span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div
                        className="px-4 py-3 mono text-xs"
                        style={{
                          color: "var(--text-dim)",
                          background: "var(--surface-2)",
                        }}
                      >
                        Loading...
                      </div>
                    )}

                    {/* Total row */}
                    {totals && (
                      <div
                        className="flex items-center justify-between px-4 py-3"
                        style={{
                          background: "var(--accent-subtle)",
                          borderTop: "1px solid var(--border)",
                        }}
                      >
                        <span
                          className="mono text-xs font-medium"
                          style={{ color: "var(--accent)" }}
                        >
                          Total
                        </span>
                        <div className="mono text-xs flex gap-3">
                          <span style={{ color: "var(--calories)" }}>
                            {Math.round(totals.calories)} kcal
                          </span>
                          <span style={{ color: "var(--protein)" }}>
                            {totals.protein.toFixed(1)}g P
                          </span>
                          <span style={{ color: "var(--carbs)" }}>
                            {totals.carbs.toFixed(1)}g C
                          </span>
                          <span style={{ color: "var(--fat)" }}>
                            {totals.fat.toFixed(1)}g F
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
