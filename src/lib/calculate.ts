export interface FoodMacros {
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
}

export interface MacroResult {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

// Core calculation — everything flows through this
export function calculateMacros(food: FoodMacros, quantityGrams: number): MacroResult {
  const ratio = quantityGrams / 100;
  return {
    calories: Math.round(food.calories_per_100g * ratio * 10) / 10,
    protein: Math.round(food.protein_per_100g * ratio * 10) / 10,
    carbs: Math.round(food.carbs_per_100g * ratio * 10) / 10,
    fat: Math.round(food.fat_per_100g * ratio * 10) / 10,
  };
}

export function sumMacros(entries: MacroResult[]): MacroResult {
  return entries.reduce(
    (acc, entry) => ({
      calories: Math.round((acc.calories + entry.calories) * 10) / 10,
      protein: Math.round((acc.protein + entry.protein) * 10) / 10,
      carbs: Math.round((acc.carbs + entry.carbs) * 10) / 10,
      fat: Math.round((acc.fat + entry.fat) * 10) / 10,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

export function calculateRemaining(
  goals: MacroResult,
  consumed: MacroResult
): MacroResult {
  return {
    calories: Math.round((goals.calories - consumed.calories) * 10) / 10,
    protein: Math.round((goals.protein - consumed.protein) * 10) / 10,
    carbs: Math.round((goals.carbs - consumed.carbs) * 10) / 10,
    fat: Math.round((goals.fat - consumed.fat) * 10) / 10,
  };
}

export function getProgressPercent(consumed: number, goal: number): number {
  if (goal === 0) return 0;
  return Math.min(Math.round((consumed / goal) * 100), 100);
}