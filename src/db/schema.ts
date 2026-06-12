import { createClient } from '@libsql/client';

if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
  throw new Error('TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set');
}

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export async function initDB(): Promise<void> {
  await client.executeMultiple(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS user_goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      calories REAL NOT NULL,
      protein REAL NOT NULL,
      carbs REAL NOT NULL,
      fat REAL NOT NULL,
      effective_from TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS foods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      calories_per_100g REAL NOT NULL,
      protein_per_100g REAL NOT NULL,
      carbs_per_100g REAL NOT NULL,
      fat_per_100g REAL NOT NULL,
      category TEXT DEFAULT 'general',
      is_custom INTEGER DEFAULT 0,
      created_by INTEGER,
      FOREIGN KEY (created_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS meals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS meal_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      meal_id INTEGER NOT NULL,
      food_id INTEGER NOT NULL,
      quantity_grams REAL NOT NULL,
      FOREIGN KEY (meal_id) REFERENCES meals(id) ON DELETE CASCADE,
      FOREIGN KEY (food_id) REFERENCES foods(id)
    );

    CREATE TABLE IF NOT EXISTS daily_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, date),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS log_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      daily_log_id INTEGER NOT NULL,
      food_id INTEGER NOT NULL,
      quantity_grams REAL NOT NULL,
      meal_id INTEGER,
      note TEXT,
      logged_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (daily_log_id) REFERENCES daily_logs(id) ON DELETE CASCADE,
      FOREIGN KEY (food_id) REFERENCES foods(id),
      FOREIGN KEY (meal_id) REFERENCES meals(id)
    );
  `);

  const columns = await client.execute('PRAGMA table_info(log_entries)');
  const hasNote = columns.rows.some(column => column.name === 'note');
  if (!hasNote) {
    await client.execute('ALTER TABLE log_entries ADD COLUMN note TEXT');
  }

  await client.execute({
    sql: `INSERT OR IGNORE INTO foods
            (id, name, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, category, is_custom, created_by)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [-1, 'Quick Log', 100, 0, 0, 0, 'system', 0, null],
  });
}

export default client;
