'use client';
import { useState, useEffect } from 'react';
import { calculateMacros, sumMacros } from '@/lib/calculate';

interface MealItem {
  food_id: number;
  name: string;
  quantity_grams: number;
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

interface Props {
  date: string;
  onLogged: () => void;
  onClose: () => void;
}

export default function MealQuickLog({ date, onLogged, onClose }: Props) {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [mealItems, setMealItems] = useState<Record<number, MealItem[]>>({});
  const [logging, setLogging] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/meals')
      .then(r => r.json())
      .then(d => setMeals(d.meals ?? []));
  }, []);

  const loadItems = async (mealId: number) => {
    if (mealItems[mealId]) return;
    const res = await fetch(`/api/meals/${mealId}`);
    const data = await res.json();
    setMealItems(prev => ({ ...prev, [mealId]: data.items }));
  };

  const toggleExpand = async (mealId: number) => {
    if (expanded === mealId) {
      setExpanded(null);
    } else {
      setExpanded(mealId);
      await loadItems(mealId);
    }
  };

  const handleLogMeal = async (mealId: number) => {
    setLogging(mealId);
    await fetch(`/api/log/meal/${mealId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date }),
    });
    setLogging(null);
    onLogged();
  };

  const getMealTotals = (items: MealItem[]) => {
    return sumMacros(
      items.map(item => calculateMacros({
        calories_per_100g: item.calories_per_100g,
        protein_per_100g: item.protein_per_100g,
        carbs_per_100g: item.carbs_per_100g,
        fat_per_100g: item.fat_per_100g,
      }, item.quantity_grams))
    );
  };

  return (
    <div className="card flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Log Meal</span>
        <button
          onClick={onClose}
          className="mono text-xs"
          style={{ color: 'var(--text-dim)' }}
        >✕</button>
      </div>

      {meals.length === 0 ? (
        <div className="text-center py-6" style={{ color: 'var(--text-dim)' }}>
          <div className="text-sm">No meals yet</div>
          <div className="text-xs mt-1">Create meals in the Meals tab</div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {meals.map(meal => {
            const items = mealItems[meal.id];
            const totals = items ? getMealTotals(items) : null;

            return (
              <div
                key={meal.id}
                className="rounded-xl overflow-hidden"
                style={{ border: "1px solid var(--border)" }}
              >
                {/* Meal header */}
                <div
                  className="flex items-center gap-3 px-4 py-3"
                  style={{ background: "var(--surface-2)" }}
                >
                  <button
                    onClick={() => toggleExpand(meal.id)}
                    className="flex-1 text-left min-w-0"
                  >
                    <div className="text-sm font-medium truncate">
                      {meal.name}
                    </div>
                    <div
                      className="mono text-xs mt-0.5"
                      style={{ color: "var(--text-dim)" }}
                    >
                      {meal.item_count}{" "}
                      {meal.item_count === 1 ? "item" : "items"}
                      {totals && (
                        <span style={{ color: "var(--calories)" }}>
                          {" · "}
                          {Math.round(totals.calories)} kcal
                        </span>
                      )}
                    </div>
                  </button>

                  <button
                    onClick={() => handleLogMeal(meal.id)}
                    disabled={logging === meal.id}
                    className="btn btn-primary btn-sm shrink-0"
                    style={{ minWidth: "64px" }}
                  >
                    {logging === meal.id ? "..." : "+ Log"}
                  </button>
                </div>

                {/* Expanded items */}
                {expanded === meal.id && items && (
                  <div style={{ borderTop: "1px solid var(--border)" }}>
                    {items.map((item, i) => {
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
                          className="flex items-center justify-between px-4 py-2.5 gap-3"
                          style={{
                            borderTop:
                              i > 0 ? "1px solid var(--border)" : "none",
                            background: "var(--surface)",
                          }}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-medium truncate">
                              {item.name}
                            </div>
                            <div
                              className="mono text-xs"
                              style={{ color: "var(--text-dim)" }}
                            >
                              {item.quantity_grams}g
                            </div>
                          </div>
                          <div
                            className="mono text-xs shrink-0"
                            style={{ color: "var(--text-dim)" }}
                          >
                            <span style={{ color: "var(--calories)" }}>
                              {Math.round(m.calories)}
                            </span>{" "}
                            kcal
                          </div>
                        </div>
                      );
                    })}

                    {/* Meal total row */}
                    {totals && (
                      <div
                        className="flex items-center justify-between px-4 py-2.5"
                        style={{
                          borderTop: "1px solid var(--border)",
                          background: "var(--surface-2)",
                        }}
                      >
                        <span
                          className="mono text-xs font-medium"
                          style={{ color: "var(--text-muted)" }}
                        >
                          Total
                        </span>
                        <div
                          className="mono text-xs"
                          style={{ color: "var(--text-muted)" }}
                        >
                          <span style={{ color: "var(--calories)" }}>
                            {Math.round(totals.calories)} kcal
                          </span>
                          {" · "}
                          {totals.protein.toFixed(1)}g P{" · "}
                          {totals.carbs.toFixed(1)}g C{" · "}
                          {totals.fat.toFixed(1)}g F
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