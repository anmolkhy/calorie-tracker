import db, { initDB } from './schema';

const foods = [
  // Grains & Cereals
  { name: 'Basmati Rice (raw)', calories: 349, protein: 7.5, carbs: 78, fat: 0.5, category: 'grains' },
  { name: 'Brown Rice (raw)', calories: 362, protein: 7.9, carbs: 76, fat: 2.7, category: 'grains' },
  { name: 'Rolled Oats (raw)', calories: 389, protein: 16.9, carbs: 66, fat: 6.9, category: 'grains' },
  { name: 'Whole Wheat Flour (atta)', calories: 340, protein: 12, carbs: 71, fat: 1.8, category: 'grains' },
  { name: 'Maida (refined flour)', calories: 348, protein: 10, carbs: 74, fat: 0.9, category: 'grains' },
  { name: 'Poha (flattened rice)', calories: 357, protein: 6.3, carbs: 77, fat: 1.2, category: 'grains' },
  { name: 'Semolina (suji)', calories: 360, protein: 12.7, carbs: 72, fat: 1.1, category: 'grains' },
  { name: 'Quinoa (raw)', calories: 368, protein: 14.1, carbs: 64, fat: 6.1, category: 'grains' },

  // Lentils & Legumes
  { name: 'Toor Dal (raw)', calories: 343, protein: 22, carbs: 57, fat: 1.7, category: 'legumes' },
  { name: 'Moong Dal (raw)', calories: 347, protein: 24, carbs: 59, fat: 1.2, category: 'legumes' },
  { name: 'Chana Dal (raw)', calories: 364, protein: 20, carbs: 60, fat: 5.6, category: 'legumes' },
  { name: 'Masoor Dal (raw)', calories: 352, protein: 24, carbs: 60, fat: 1.1, category: 'legumes' },
  { name: 'Rajma (raw)', calories: 333, protein: 24, carbs: 60, fat: 1.5, category: 'legumes' },
  { name: 'Chickpeas (raw)', calories: 364, protein: 19, carbs: 61, fat: 6, category: 'legumes' },
  { name: 'Black Chana (raw)', calories: 364, protein: 19, carbs: 61, fat: 6, category: 'legumes' },

  // Dairy
  { name: 'Whole Milk', calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3, category: 'dairy' },
  { name: 'Toned Milk', calories: 44, protein: 3.5, carbs: 4.6, fat: 1.5, category: 'dairy' },
  { name: 'Paneer (full fat)', calories: 265, protein: 18.3, carbs: 1.2, fat: 20.8, category: 'dairy' },
  { name: 'Curd / Dahi (full fat)', calories: 98, protein: 3.1, carbs: 3.4, fat: 4.3, category: 'dairy' },
  { name: 'Greek Yogurt', calories: 59, protein: 10, carbs: 3.6, fat: 0.4, category: 'dairy' },
  { name: 'Butter', calories: 717, protein: 0.9, carbs: 0.1, fat: 81, category: 'dairy' },
  { name: 'Ghee', calories: 900, protein: 0, carbs: 0, fat: 100, category: 'dairy' },
  { name: 'Whey Protein Powder', calories: 400, protein: 80, carbs: 8, fat: 5, category: 'dairy' },

  // Proteins
  { name: 'Chicken Breast (raw)', calories: 120, protein: 22.5, carbs: 0, fat: 2.6, category: 'protein' },
  { name: 'Chicken Thigh (raw)', calories: 177, protein: 18, carbs: 0, fat: 11, category: 'protein' },
  { name: 'Eggs (whole)', calories: 155, protein: 13, carbs: 1.1, fat: 11, category: 'protein' },
  { name: 'Egg White', calories: 52, protein: 11, carbs: 0.7, fat: 0.2, category: 'protein' },
  { name: 'Salmon (raw)', calories: 208, protein: 20, carbs: 0, fat: 13, category: 'protein' },
  { name: 'Tuna (canned in water)', calories: 116, protein: 26, carbs: 0, fat: 1, category: 'protein' },

  // Vegetables
  { name: 'Spinach (raw)', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, category: 'vegetables' },
  { name: 'Broccoli (raw)', calories: 34, protein: 2.8, carbs: 7, fat: 0.4, category: 'vegetables' },
  { name: 'Tomato', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, category: 'vegetables' },
  { name: 'Onion', calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, category: 'vegetables' },
  { name: 'Potato (raw)', calories: 77, protein: 2, carbs: 17, fat: 0.1, category: 'vegetables' },
  { name: 'Sweet Potato (raw)', calories: 86, protein: 1.6, carbs: 20, fat: 0.1, category: 'vegetables' },
  { name: 'Carrot (raw)', calories: 41, protein: 0.9, carbs: 10, fat: 0.2, category: 'vegetables' },
  { name: 'Cucumber', calories: 15, protein: 0.7, carbs: 3.6, fat: 0.1, category: 'vegetables' },

  // Fruits
  { name: 'Banana', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, category: 'fruits' },
  { name: 'Apple', calories: 52, protein: 0.3, carbs: 14, fat: 0.2, category: 'fruits' },
  { name: 'Mango', calories: 60, protein: 0.8, carbs: 15, fat: 0.4, category: 'fruits' },
  { name: 'Orange', calories: 47, protein: 0.9, carbs: 12, fat: 0.1, category: 'fruits' },
  { name: 'Watermelon', calories: 30, protein: 0.6, carbs: 7.6, fat: 0.2, category: 'fruits' },

  // Oils & Fats
  { name: 'Olive Oil', calories: 884, protein: 0, carbs: 0, fat: 100, category: 'oils' },
  { name: 'Vegetable Oil', calories: 884, protein: 0, carbs: 0, fat: 100, category: 'oils' },
  { name: 'Coconut Oil', calories: 892, protein: 0, carbs: 0, fat: 99, category: 'oils' },

  // Nuts & Seeds
  { name: 'Almonds', calories: 579, protein: 21, carbs: 22, fat: 50, category: 'nuts' },
  { name: 'Peanuts (raw)', calories: 567, protein: 26, carbs: 16, fat: 49, category: 'nuts' },
  { name: 'Peanut Butter', calories: 588, protein: 25, carbs: 20, fat: 50, category: 'nuts' },
  { name: 'Chia Seeds', calories: 486, protein: 17, carbs: 42, fat: 31, category: 'nuts' },
  { name: 'Flax Seeds', calories: 534, protein: 18, carbs: 29, fat: 42, category: 'nuts' },
];

export function seedFoods() {
  const existingCount = db.prepare('SELECT COUNT(*) as count FROM foods WHERE is_custom = 0').get() as { count: number };
  if (existingCount.count > 0) {
    console.log('Foods already seeded, skipping...');
    return;
  }

  const insert = db.prepare(`
    INSERT INTO foods (name, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, category, is_custom)
    VALUES (@name, @calories, @protein, @carbs, @fat, @category, 0)
  `);

  const insertMany = db.transaction((foods: typeof foods) => {
    for (const food of foods) insert.run(food);
  });

  insertMany(foods);
  console.log(`Seeded ${foods.length} foods successfully.`);
}

export function runMigrations() {
  initDB();
  seedFoods();
  console.log('Database ready.');
}