"use client";
import { useState, useEffect } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

interface Goals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface ChartInstance {
  destroy: () => void;
}

interface ChartCanvas extends HTMLCanvasElement {
  _chartInstance?: ChartInstance;
}

interface ChartConstructor {
  new (
    element: HTMLCanvasElement,
    config: {
      type: "doughnut";
      data: {
        datasets: {
          data: number[];
          backgroundColor: string[];
          borderWidth: number;
          hoverOffset: number;
        }[];
      };
      options: {
        responsive: boolean;
        cutout: string;
        plugins: {
          legend: { display: boolean };
          tooltip: { enabled: boolean };
        };
        animation: { duration: number };
      };
    },
  ): ChartInstance;
}

declare global {
  interface Window {
    Chart?: ChartConstructor;
  }
}

export default function SettingsPage() {
  const [goals, setGoals] = useState<Goals>({
    calories: 2000,
    protein: 150,
    carbs: 200,
    fat: 65,
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/goals")
      .then((r) => r.json())
      .then((d) => {
        if (d.goals)
          setGoals({
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
    setError("");
    setSaved(false);

    const res = await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(goals),
    });

    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      const d = await res.json();
      setError(d.error ?? "Failed to save");
    }
    setSaving(false);
  };

  const updateGoal = (key: keyof Goals, value: string) => {
    setGoals((g) => ({ ...g, [key]: Number(value) }));
  };

  // Calculate implied calories from macros
  const impliedCalories = Math.round(
    goals.protein * 4 + goals.carbs * 4 + goals.fat * 9,
  );

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="mono text-sm" style={{ color: "var(--text-dim)" }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-6 fade-up">
      <div>
        <h1 className="text-xl font-semibold">Daily Goals</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          Set your daily calorie and macro targets
        </p>
      </div>

      {/* Calorie target */}
      <div className="card flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Calories</span>
          <span className="mono text-xs" style={{ color: "var(--text-dim)" }}>
            kcal / day
          </span>
        </div>

        <Input
          type="number"
          value={goals.calories}
          onChange={(e) => updateGoal("calories", e.target.value)}
          min="500"
          max="10000"
        />

        {/* Implied calories hint */}
        <div
          className="flex items-center justify-between px-3 py-2.5 rounded-lg mono text-xs"
          style={{ background: "var(--surface-2)", color: "var(--text-dim)" }}
        >
          <span>Implied from macros below</span>
          <span
            style={{
              color:
                impliedCalories === goals.calories
                  ? "var(--accent)"
                  : "var(--orange)",
            }}
          >
            {impliedCalories} kcal
          </span>
        </div>

        <p className="text-xs" style={{ color: "var(--text-dim)" }}>
          Protein & carbs = 4 kcal/g · Fat = 9 kcal/g. Ideally your calorie goal
          matches the implied value.
        </p>
      </div>

      {/* Macro targets */}
      <div className="card flex flex-col gap-5">
        <span className="text-sm font-medium">Macros</span>

        {[
          {
            key: "protein" as const,
            label: "Protein",
            color: "var(--protein)",
            kcalPer: 4,
          },
          {
            key: "carbs" as const,
            label: "Carbohydrates",
            color: "var(--carbs)",
            kcalPer: 4,
          },
          {
            key: "fat" as const,
            label: "Fat",
            color: "var(--fat)",
            kcalPer: 9,
          },
        ].map(({ key, label, color, kcalPer }) => (
          <div key={key} className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium" style={{ color }}>
                {label}
              </span>
              <div
                className="mono text-xs"
                style={{ color: "var(--text-dim)" }}
              >
                {Math.round(goals[key] * kcalPer)} kcal
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                value={goals[key]}
                onChange={(e) => updateGoal(key, e.target.value)}
                min="0"
                max="1000"
                className="flex-1"
              />
              <span
                className="mono text-sm shrink-0"
                style={{ color: "var(--text-dim)" }}
              >
                g
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Macro Split — Donut Chart */}
      <div className="card flex flex-col gap-4">
        <span className="text-sm font-medium">Macro Split</span>

        {(() => {
          const proteinKcal = goals.protein * 4;
          const carbsKcal = goals.carbs * 4;
          const fatKcal = goals.fat * 9;
          const gapKcal = Math.max(goals.calories - impliedCalories, 0);
          const total = goals.calories || 1;
          const gapPercent = Math.round((gapKcal / total) * 100);
          const showGap = gapPercent >= 5;

          const items = [
            {
              label: "Protein",
              kcal: proteinKcal,
              grams: goals.protein,
              color: "var(--protein)",
              hex: "#4488ff",
            },
            {
              label: "Carbs",
              kcal: carbsKcal,
              grams: goals.carbs,
              color: "var(--carbs)",
              hex: "#ff8c00",
            },
            {
              label: "Fat",
              kcal: fatKcal,
              grams: goals.fat,
              color: "var(--fat)",
              hex: "#cc44ff",
            },
          ];

          const chartData = [
            ...items.map((i) => i.kcal),
            ...(showGap ? [gapKcal] : []),
          ];
          const chartColors = [
            ...items.map((i) => i.hex),
            ...(showGap ? ["#1e1e1e"] : []),
          ];
          const chartKey = chartData.join("-");

          return (
            <div className="flex items-center gap-6">
              {/* Chart */}
              <div
                className="relative shrink-0"
                style={{ width: 130, height: 130 }}
              >
                <canvas
                  key={chartKey}
                  ref={(el) => {
                    if (!el) return;
                    const chartCanvas = el as ChartCanvas;
                    const existing = chartCanvas._chartInstance;
                    if (existing) existing.destroy();
                    const Chart = window.Chart;
                    if (!Chart) return;
                    chartCanvas._chartInstance = new Chart(el, {
                      type: "doughnut",
                      data: {
                        datasets: [
                          {
                            data: chartData,
                            backgroundColor: chartColors,
                            borderWidth: 0,
                            hoverOffset: 0,
                          },
                        ],
                      },
                      options: {
                        responsive: false,
                        cutout: "62%",
                        plugins: {
                          legend: { display: false },
                          tooltip: { enabled: false },
                        },
                        animation: { duration: 400 },
                      },
                    });
                  }}
                  width={130}
                  height={130}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                  <span
                    className="mono font-medium"
                    style={{
                      fontSize: "16px",
                      color: "var(--text)",
                      lineHeight: 1.2,
                    }}
                  >
                    {impliedCalories}
                  </span>
                  <span
                    className="mono"
                    style={{
                      fontSize: "9px",
                      color: "var(--text-dim)",
                      marginTop: 2,
                    }}
                  >
                    of {goals.calories}
                  </span>
                  <span
                    className="mono"
                    style={{ fontSize: "9px", color: "var(--text-dim)" }}
                  >
                    kcal
                  </span>
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-col gap-2.5 flex-1">
                {items.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="rounded-full shrink-0"
                        style={{ width: 7, height: 7, background: item.color }}
                      />
                      <span
                        className="text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {item.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mono text-xs">
                      <span style={{ color: item.color }}>
                        {Math.round((item.kcal / total) * 100)}%
                      </span>
                      <span style={{ color: "var(--text-dim)" }}>
                        {item.grams}g
                      </span>
                    </div>
                  </div>
                ))}

                {showGap && (
                  <>
                    <div
                      style={{ height: "0.5px", background: "var(--border)" }}
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="rounded-full shrink-0"
                          style={{
                            width: 7,
                            height: 7,
                            background: "var(--border-hover)",
                          }}
                        />
                        <span
                          className="text-xs"
                          style={{ color: "var(--text-dim)" }}
                        >
                          Gap
                        </span>
                      </div>
                      <span
                        className="mono text-xs"
                        style={{ color: "var(--text-dim)" }}
                      >
                        {gapPercent}%
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })()}

        {/* Sync warning */}
        {Math.abs(goals.calories - impliedCalories) > 50 && (
          <div
            className="flex items-center justify-between px-3 py-2.5 rounded-lg"
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--orange)",
            }}
          >
            <span className="text-xs" style={{ color: "var(--orange)" }}>
              Macros imply {impliedCalories} kcal — goal is {goals.calories}{" "}
              kcal
            </span>
            <button
              onClick={() =>
                setGoals((g) => ({ ...g, calories: impliedCalories }))
              }
              className="mono text-xs px-2.5 py-1 rounded ml-3 shrink-0"
              style={{
                background: "var(--accent-subtle)",
                color: "var(--accent)",
                border: "1px solid var(--accent-dim)",
              }}
            >
              Sync
            </button>
          </div>
        )}
      </div>

      {error && <div className="error-msg">{error}</div>}

      {saved && (
        <div
          className="px-4 py-3 rounded-lg text-sm mono"
          style={{
            background: "var(--accent-subtle)",
            color: "var(--accent)",
            border: "1px solid var(--accent-dim)",
          }}
        >
          ✓ Goals saved successfully
        </div>
      )}

      <Button onClick={handleSave} disabled={saving} fullWidth>
        {saving ? "Saving..." : "Save Goals"}
      </Button>
    </div>
  );
}
