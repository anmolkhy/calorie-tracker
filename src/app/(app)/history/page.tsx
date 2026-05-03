'use client';
import { useState, useEffect } from 'react';

interface DayTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface WeekDay {
  date: string;
  totals: DayTotals;
}

interface Goals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

function formatDisplayDate(dateStr: string): string {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  if (dateStr === today) return 'Today';
  if (dateStr === yesterday) return 'Yesterday';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

function formatShortDay(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', { weekday: 'short' });
}

export default function HistoryPage() {
  const [week, setWeek] = useState<WeekDay[]>([]);
  const [goals, setGoals] = useState<Goals>({ calories: 2000, protein: 150, carbs: 200, fat: 65 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/log/week').then(r => r.json()),
      fetch('/api/goals').then(r => r.json()),
    ]).then(([weekData, goalsData]) => {
      setWeek(weekData.week ?? []);
      if (goalsData.goals) setGoals(goalsData.goals);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="mono text-sm" style={{ color: 'var(--text-dim)' }}>Loading...</div>
      </div>
    );
  }

  const totalCaloriesWeek = week.reduce((sum, d) => sum + d.totals.calories, 0);
  const avgCaloriesDay = week.length > 0 ? totalCaloriesWeek / week.length : 0;
  const daysLogged = week.filter(d => d.totals.calories > 0).length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-6 fade-up">

      <div>
        <h1 className="text-xl font-semibold">History</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Last 7 days</p>
      </div>

      {/* Week summary stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Days Logged', value: `${daysLogged}/7`, color: 'var(--accent)' },
          { label: 'Avg Calories', value: Math.round(avgCaloriesDay), color: 'var(--calories)' },
          { label: 'Goal', value: goals.calories, color: 'var(--text-muted)' },
        ].map(stat => (
          <div
            key={stat.label}
            className="card text-center"
            style={{ padding: '16px' }}
          >
            <div className="mono text-xl font-medium" style={{ color: stat.color }}>
              {stat.value}
            </div>
            <div className="text-xs mt-1 uppercase tracking-wider" style={{ color: 'var(--text-dim)' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div className="card flex flex-col gap-4">
        <span className="text-sm font-medium">Calories This Week</span>
        <div className="flex items-end gap-2 h-32">
          {week.map(day => {
            const percent = goals.calories > 0
              ? Math.min((day.totals.calories / goals.calories) * 100, 100)
              : 0;
            const isToday = day.date === new Date().toISOString().split('T')[0];
            const over = day.totals.calories > goals.calories;

            return (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="mono text-xs" style={{ color: 'var(--text-dim)' }}>
                  {day.totals.calories > 0 ? Math.round(day.totals.calories) : ''}
                </div>
                <div className="w-full flex flex-col justify-end" style={{ height: '80px' }}>
                  <div
                    className="w-full rounded-t-sm transition-all duration-500"
                    style={{
                      height: `${Math.max(percent, day.totals.calories > 0 ? 4 : 0)}%`,
                      background: over
                        ? 'var(--red)'
                        : isToday
                        ? 'var(--accent)'
                        : 'var(--surface-2)',
                      border: isToday ? 'none' : `1px solid var(--border)`,
                      minHeight: day.totals.calories > 0 ? '4px' : '0',
                    }}
                  />
                </div>
                <div
                  className="mono text-xs"
                  style={{ color: isToday ? 'var(--accent)' : 'var(--text-dim)' }}
                >
                  {formatShortDay(day.date)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Goal line indicator */}
        <div className="flex items-center gap-2 mono text-xs" style={{ color: 'var(--text-dim)' }}>
          <div className="w-4 h-px" style={{ background: 'var(--border-hover)' }} />
          <span>Goal: {goals.calories} kcal</span>
        </div>
      </div>

      {/* Day by day breakdown */}
      <div className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
          Daily Breakdown
        </span>

        {[...week].reverse().map(day => {
          const hasData = day.totals.calories > 0;
          const caloriePercent = goals.calories > 0
            ? Math.min((day.totals.calories / goals.calories) * 100, 100)
            : 0;
          const over = day.totals.calories > goals.calories;
          const isToday = day.date === new Date().toISOString().split('T')[0];

          return (
            <div
              key={day.date}
              className="px-4 py-3.5 rounded-xl"
              style={{
                background: 'var(--surface)',
                border: `1px solid ${isToday ? 'var(--border-hover)' : 'var(--border)'}`,
                opacity: hasData ? 1 : 0.5,
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{formatDisplayDate(day.date)}</span>
                  {isToday && (
                    <span
                      className="mono text-xs px-1.5 py-0.5 rounded"
                      style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}
                    >
                      today
                    </span>
                  )}
                </div>
                <div className="mono text-sm font-medium" style={{
                  color: !hasData ? 'var(--text-dim)' : over ? 'var(--red)' : 'var(--accent)'
                }}>
                  {hasData ? `${Math.round(day.totals.calories)} kcal` : '—'}
                </div>
              </div>

              {hasData && (
                <>
                  {/* Calorie bar */}
                  <div className="macro-track mb-2.5">
                    <div
                      className="macro-fill"
                      style={{
                        width: `${caloriePercent}%`,
                        background: over ? 'var(--red)' : 'var(--accent)',
                      }}
                    />
                  </div>

                  {/* Macro breakdown */}
                  <div className="grid grid-cols-3 gap-2 mono text-xs">
                    <span style={{ color: 'var(--protein)' }}>
                      P {day.totals.protein.toFixed(1)}g
                    </span>
                    <span style={{ color: 'var(--carbs)' }}>
                      C {day.totals.carbs.toFixed(1)}g
                    </span>
                    <span style={{ color: 'var(--fat)' }}>
                      F {day.totals.fat.toFixed(1)}g
                    </span>
                  </div>
                </>
              )}

              {!hasData && (
                <div className="mono text-xs" style={{ color: 'var(--text-dim)' }}>
                  Nothing logged
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}