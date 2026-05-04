'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/AuthContext';
import MacroBar from '@/components/ui/MacroBar';
import Button from '@/components/ui/Button';
import FoodSearch from '@/components/log/FoodSearch';
import LogEntryRow from '@/components/log/LogEntryRow';
import MealQuickLog from '@/components/meals/MealQuickLog';

interface MacroTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface Goals extends MacroTotals {}

interface EntryMacros extends MacroTotals {}

interface LogEntry {
  id: number;
  food_id: number;
  name: string;
  quantity_grams: number;
  meal_id: number | null;
  meal_name: string | null;
  macros: EntryMacros;
}

const EMPTY_MACROS: MacroTotals = { calories: 0, protein: 0, carbs: 0, fat: 0 };

const DEFAULT_GOALS: Goals = { calories: 2000, protein: 150, carbs: 200, fat: 65 };

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function displayDate(dateStr: string): string {
  const today = formatDate(new Date());
  const yesterday = formatDate(new Date(Date.now() - 86400000));
  if (dateStr === today) return 'Today';
  if (dateStr === yesterday) return 'Yesterday';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [date, setDate] = useState(formatDate(new Date()));
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [totals, setTotals] = useState<MacroTotals>(EMPTY_MACROS);
  const [goals, setGoals] = useState<Goals>(DEFAULT_GOALS);
  const [loading, setLoading] = useState(true);
  const [showFoodSearch, setShowFoodSearch] = useState(false);
  const [showMeals, setShowMeals] = useState(false);

  const fetchGoals = useCallback(async () => {
    const res = await fetch('/api/goals');
    if (res.ok) {
      const data = await res.json();
      if (data.goals) setGoals(data.goals);
    }
  }, []);

  const fetchLog = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/log?date=${date}`);
    if (res.ok) {
      const data = await res.json();
      setEntries(data.entries ?? []);
      setTotals(data.totals ?? EMPTY_MACROS);
    }
    setLoading(false);
  }, [date]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  useEffect(() => {
    fetchLog();
  }, [fetchLog]);

  const handleDelete = async (id: number) => {
    await fetch(`/api/log/entry/${id}`, { method: 'DELETE' });
    fetchLog();
  };

  const handleLogged = () => {
    setShowFoodSearch(false);
    setShowMeals(false);
    fetchLog();
  };

  const remaining = {
    calories: goals.calories - (totals?.calories ?? 0),
    protein: goals.protein - (totals?.protein ?? 0),
    carbs: goals.carbs - (totals?.carbs ?? 0),
    fat: goals.fat - (totals?.fat ?? 0),
  };

  const caloriePercent = Math.min((totals.calories / goals.calories) * 100, 100);

  // Navigate dates
  const goToPrev = () => {
    const d = new Date(date);
    d.setDate(d.getDate() - 1);
    setDate(formatDate(d));
  };

  const goToNext = () => {
    const d = new Date(date);
    d.setDate(d.getDate() + 1);
    const today = formatDate(new Date());
    if (formatDate(d) <= today) setDate(formatDate(d));
  };

  const isToday = date === formatDate(new Date());

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-6 fade-up">
      {/* Date navigator */}
      <div className="flex items-center justify-between">
        <button onClick={goToPrev} className="btn btn-ghost btn-sm">
          ←
        </button>
        <div className="text-center">
          <div className="text-base font-semibold">{displayDate(date)}</div>
        </div>
        <button
          onClick={goToNext}
          disabled={isToday}
          className="btn btn-ghost btn-sm"
          style={{ opacity: isToday ? 0.3 : 1 }}
        >
          →
        </button>
      </div>

      {/* Calorie summary card */}
      <div className="card">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div
              className="text-xs uppercase tracking-widest mb-1"
              style={{ color: "var(--text-muted)" }}
            >
              Calories
            </div>
            <div className="flex items-baseline gap-2">
              <span
                className="mono text-4xl font-medium"
                style={{ color: "var(--accent)" }}
              >
                {Math.round(totals.calories)}
              </span>
              <span
                className="mono text-sm"
                style={{ color: "var(--text-dim)" }}
              >
                / {goals.calories} kcal
              </span>
            </div>
          </div>
          <div className="text-right">
            <div
              className="text-xs uppercase tracking-widest mb-1"
              style={{ color: "var(--text-muted)" }}
            >
              Remaining
            </div>
            <div
              className="mono text-2xl font-medium"
              style={{
                color: remaining.calories < 0 ? "var(--red)" : "var(--text)",
              }}
            >
              {Math.round(Math.abs(remaining.calories))}
              <span
                className="text-sm ml-1"
                style={{ color: "var(--text-dim)" }}
              >
                {remaining.calories < 0 ? "over" : "left"}
              </span>
            </div>
          </div>
        </div>

        {/* Calorie progress bar */}
        <div className="macro-track mb-6">
          <div
            className="macro-fill"
            style={{
              width: `${caloriePercent}%`,
              background:
                caloriePercent >= 100 ? "var(--red)" : "var(--accent)",
            }}
          />
        </div>

        {/* Macro bars */}
        <div className="grid grid-cols-3 gap-4">
          <MacroBar
            label="Protein"
            consumed={totals.protein}
            goal={goals.protein}
            color="var(--protein)"
          />
          <MacroBar
            label="Carbs"
            consumed={totals.carbs}
            goal={goals.carbs}
            color="var(--carbs)"
          />
          <MacroBar
            label="Fat"
            consumed={totals.fat}
            goal={goals.fat}
            color="var(--fat)"
          />
        </div>
      </div>

      {/* Quick log actions */}
      <div className="flex gap-3">
        <Button
          onClick={() => {
            setShowFoodSearch((s) => !s);
            setShowMeals(false);
          }}
          fullWidth
          className="flex-1"
        >
          + Log Food
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            setShowMeals((s) => !s);
            setShowFoodSearch(false);
          }}
          className="flex-1"
        >
          ◈ Log Meal
        </Button>
      </div>

      {/* Food search panel */}
      {showFoodSearch && (
        <FoodSearch
          date={date}
          onLogged={handleLogged}
          onClose={() => setShowFoodSearch(false)}
        />
      )}

      {/* Meal quick log panel */}
      {showMeals && (
        <MealQuickLog
          date={date}
          onLogged={handleLogged}
          onClose={() => setShowMeals(false)}
        />
      )}

      {/* Log entries */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between mb-1">
          <span
            className="text-xs uppercase tracking-widest"
            style={{ color: "var(--text-muted)" }}
          >
            Today's Log
          </span>
          <span className="mono text-xs" style={{ color: "var(--text-dim)" }}>
            {entries.length} {entries.length === 1 ? "item" : "items"}
          </span>
        </div>

        {loading ? (
          <div
            className="text-center py-8"
            style={{ color: "var(--text-dim)" }}
          >
            <span className="mono text-sm">Loading...</span>
          </div>
        ) : entries.length === 0 ? (
          <div
            className="rounded-xl py-10 text-center"
            style={{ border: "1px dashed var(--border)" }}
          >
            <div className="text-2xl mb-2">◎</div>
            <div className="text-sm" style={{ color: "var(--text-muted)" }}>
              Nothing logged yet
            </div>
            <div className="text-xs mt-1" style={{ color: "var(--text-dim)" }}>
              Tap "Log Food" to get started
            </div>
          </div>
        ) : (
          entries.map((entry) => (
            <LogEntryRow
              key={entry.id}
              entry={entry}
              onDelete={() => handleDelete(entry.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}