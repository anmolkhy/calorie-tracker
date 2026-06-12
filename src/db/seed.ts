import client, { initDB } from './schema';

const foods = [
  { name: 'Atom Whey — Choco Hazel Fusion', calories: 378, protein: 75, carbs: 13.1, fat: 2.8, category: 'supplements' },
  { name: 'Atom Whey — Double Rich Chocolate', calories: 389, protein: 75, carbs: 16.1, fat: 2.8, category: 'supplements' },
  { name: 'Superyou Wafer — Choco Hazelnut', calories: 455, protein: 25, carbs: 45, fat: 25, category: 'supplements' },
  { name: 'Superyou Wafer — Cookies & Cream', calories: 475, protein: 25, carbs: 50, fat: 25.5, category: 'supplements' },
  { name: 'Superyou Wafer — Mango', calories: 475, protein: 25, carbs: 50, fat: 25, category: 'supplements' },
  { name: 'ID Fresh High Protein Low Fat Paneer', calories: 163, protein: 28, carbs: 4.88, fat: 3, category: 'dairy' },
  { name: 'ID Fresh Paneer (full fat)', calories: 302, protein: 18, carbs: 1.2, fat: 23, category: 'dairy' },
  { name: 'Paneer — Local Dairy (full fat)', calories: 265, protein: 18.3, carbs: 1.2, fat: 20.8, category: 'dairy' },
  { name: 'Cow Milk — Full Cream (Amul/Gokul)', calories: 61, protein: 3.2, carbs: 4.8, fat: 3.5, category: 'dairy' },
  { name: 'Curd / Dahi (full fat)', calories: 98, protein: 3.1, carbs: 3.4, fat: 4.3, category: 'dairy' },
  { name: 'Butter (Amul)', calories: 720, protein: 0.5, carbs: 0.5, fat: 80, category: 'dairy' },
  { name: 'Ghee', calories: 900, protein: 0, carbs: 0, fat: 100, category: 'dairy' },
  { name: 'Eggs — Whole (raw)', calories: 143, protein: 12.6, carbs: 0.8, fat: 9.5, category: 'dairy' },
  { name: 'Egg White (raw)', calories: 52, protein: 10.9, carbs: 0.7, fat: 0.2, category: 'dairy' },
  { name: 'Chicken Curry Cut — Licious (raw)', calories: 127, protein: 21.6, carbs: 0, fat: 4.5, category: 'protein' },
  { name: 'Chicken Breast (raw)', calories: 120, protein: 22.5, carbs: 0, fat: 2.6, category: 'protein' },
  { name: 'Soya Chunks (raw, dry)', calories: 345, protein: 52, carbs: 33, fat: 0.5, category: 'protein' },
  { name: 'Roasted Chana', calories: 364, protein: 20, carbs: 60, fat: 6, category: 'snacks' },
  { name: 'Quaker Oats (raw)', calories: 407, protein: 11.8, carbs: 68.5, fat: 9.5, category: 'grains' },
  { name: 'Aashirvaad Whole Wheat Atta', calories: 363, protein: 12, carbs: 75, fat: 1.7, category: 'grains' },
  { name: 'Basmati Rice (raw)', calories: 349, protein: 7.5, carbs: 78, fat: 0.5, category: 'grains' },
  { name: 'Brown Rice (raw)', calories: 362, protein: 7.9, carbs: 76, fat: 2.7, category: 'grains' },
  { name: 'Poha (flattened rice, raw)', calories: 357, protein: 6.3, carbs: 77, fat: 1.2, category: 'grains' },
  { name: 'Semolina / Suji (raw)', calories: 360, protein: 12.7, carbs: 72, fat: 1.1, category: 'grains' },
  { name: 'Toor Dal (raw)', calories: 343, protein: 22, carbs: 57, fat: 1.7, category: 'legumes' },
  { name: 'Moong Dal (raw)', calories: 347, protein: 24, carbs: 59, fat: 1.2, category: 'legumes' },
  { name: 'Chana Dal (raw)', calories: 364, protein: 20, carbs: 60, fat: 5.6, category: 'legumes' },
  { name: 'Masoor Dal (raw)', calories: 352, protein: 24, carbs: 60, fat: 1.1, category: 'legumes' },
  { name: 'Rajma (raw)', calories: 333, protein: 24, carbs: 60, fat: 1.5, category: 'legumes' },
  { name: 'Potato (raw)', calories: 77, protein: 2, carbs: 17, fat: 0.1, category: 'vegetables' },
  { name: 'Sweet Potato (raw)', calories: 86, protein: 1.6, carbs: 20, fat: 0.1, category: 'vegetables' },
  { name: 'Onion (raw)', calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, category: 'vegetables' },
  { name: 'Tomato (raw)', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, category: 'vegetables' },
  { name: 'Capsicum (raw)', calories: 31, protein: 1, carbs: 6, fat: 0.3, category: 'vegetables' },
  { name: 'Ladyfinger / Okra (raw)', calories: 33, protein: 1.9, carbs: 7.5, fat: 0.2, category: 'vegetables' },
  { name: 'Spinach (raw)', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, category: 'vegetables' },
  { name: 'Broccoli (raw)', calories: 34, protein: 2.8, carbs: 7, fat: 0.4, category: 'vegetables' },
  { name: 'Carrot (raw)', calories: 41, protein: 0.9, carbs: 10, fat: 0.2, category: 'vegetables' },
  { name: 'Banana', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, category: 'fruits' },
  { name: 'Muskmelon / Kharbuja', calories: 34, protein: 0.8, carbs: 8.2, fat: 0.2, category: 'fruits' },
  { name: 'Apple', calories: 52, protein: 0.3, carbs: 14, fat: 0.2, category: 'fruits' },
  { name: 'Mango', calories: 60, protein: 0.8, carbs: 15, fat: 0.4, category: 'fruits' },
  { name: 'Orange', calories: 47, protein: 0.9, carbs: 11.8, fat: 0.1, category: 'fruits' },
  { name: 'Kiwi', calories: 61, protein: 1.1, carbs: 14.7, fat: 0.5, category: 'fruits' },
  { name: 'Watermelon', calories: 30, protein: 0.6, carbs: 7.6, fat: 0.2, category: 'fruits' },
  { name: 'Papaya', calories: 43, protein: 0.5, carbs: 10.8, fat: 0.3, category: 'fruits' },
  { name: 'Raisins / Kishmish', calories: 299, protein: 3.1, carbs: 79.2, fat: 0.5, category: 'fruits' },
  { name: 'Almonds', calories: 579, protein: 21.2, carbs: 21.6, fat: 49.9, category: 'nuts' },
  { name: 'Cashews (raw)', calories: 553, protein: 18.2, carbs: 30.2, fat: 43.8, category: 'nuts' },
  { name: 'Walnuts', calories: 654, protein: 15.2, carbs: 13.7, fat: 65.2, category: 'nuts' },
  { name: 'Peanuts (raw)', calories: 567, protein: 25.8, carbs: 16.1, fat: 49.2, category: 'nuts' },
  { name: 'Peanut Butter (natural)', calories: 588, protein: 25, carbs: 20, fat: 50, category: 'nuts' },
  { name: 'Chia Seeds', calories: 486, protein: 16.5, carbs: 42.1, fat: 30.7, category: 'seeds' },
  { name: 'Flax Seeds', calories: 534, protein: 18.3, carbs: 28.9, fat: 42.2, category: 'seeds' },
  { name: 'Pumpkin Seeds', calories: 574, protein: 29.8, carbs: 14.7, fat: 49.1, category: 'seeds' },
  { name: 'Sunflower Seeds', calories: 584, protein: 20.8, carbs: 20, fat: 51.5, category: 'seeds' },
  { name: 'Mustard Oil', calories: 884, protein: 0, carbs: 0, fat: 100, category: 'oils' },
  { name: 'Coconut Oil', calories: 892, protein: 0, carbs: 0, fat: 99, category: 'oils' },
  { name: 'Olive Oil', calories: 884, protein: 0, carbs: 0, fat: 100, category: 'oils' },
];

export async function seedFoods(): Promise<void> {
  const result = await client.execute(
    "SELECT COUNT(*) as count FROM foods WHERE is_custom = 0 AND category <> 'system'"
  );
  const count = result.rows[0].count as number;
  if (count > 0) {
    console.log('Foods already seeded, skipping...');
    return;
  }

  for (const food of foods) {
    await client.execute({
      sql: `INSERT INTO foods (name, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, category, is_custom)
            VALUES (?, ?, ?, ?, ?, ?, 0)`,
      args: [food.name, food.calories, food.protein, food.carbs, food.fat, food.category],
    });
  }
  console.log(`Seeded ${foods.length} foods successfully.`);
}

export async function runMigrations(): Promise<void> {
  await initDB();
  await seedFoods();
  console.log('Database ready.');
}
