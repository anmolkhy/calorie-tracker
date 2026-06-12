export interface User {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  created_at: string;
}

export interface UserGoals {
  id: number;
  user_id: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  effective_from: string;
}

export interface Food {
  id: number;
  name: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  category: string;
  is_custom: number;
  created_by: number | null;
}

export interface Meal {
  id: number;
  user_id: number;
  name: string;
  created_at: string;
  item_count?: number;
}

export interface MealItem {
  id: number;
  meal_id: number;
  food_id: number;
  quantity_grams: number;
  // joined fields
  name?: string;
  calories_per_100g?: number;
  protein_per_100g?: number;
  carbs_per_100g?: number;
  fat_per_100g?: number;
}

export interface DailyLog {
  id: number;
  user_id: number;
  date: string;
  created_at: string;
}

export interface LogEntry {
  id: number;
  daily_log_id: number;
  food_id: number;
  quantity_grams: number;
  meal_id: number | null;
  note: string | null;
  logged_at: string;
  // joined fields
  name?: string;
  calories_per_100g?: number;
  protein_per_100g?: number;
  carbs_per_100g?: number;
  fat_per_100g?: number;
  meal_name?: string | null;
}

// LogEntry with guaranteed joined food fields (used in daily log queries)
export interface LogEntryWithFood extends LogEntry {
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  name: string;
}
