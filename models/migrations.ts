import type { SQLiteDatabase } from 'expo-sqlite';

const DATABASE_VERSION = 1;

export async function dropAllTables(db: SQLiteDatabase) {
  // 1) Get all tables and views
  const items = await db.getAllAsync<{ type: string; name: string }>(
    `SELECT type, name
       FROM sqlite_master
      WHERE type IN ('table','view')
        AND name NOT LIKE 'sqlite_%';`
  );

  // 2) Drop views first, then tables
  for (const { type, name } of items) {
    if (type === 'view') {
      await db.execAsync(`DROP VIEW IF EXISTS "${name}";`);
    }
  }
  for (const { type, name } of items) {
    if (type === 'table') {
      await db.execAsync(`DROP TABLE IF EXISTS "${name}";`);
    }
  }

  await db.execAsync(`PRAGMA user_version = 0;`);
}

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  //await dropAllTables(db);
  
  const { user_version: current } = await db.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version'
  );
  
  if (current < 1) {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE Ingredients (
        id            INTEGER PRIMARY KEY NOT NULL,
        title         TEXT    NOT NULL UNIQUE,
        kcal          REAL    NOT NULL,
        proteins      REAL    NOT NULL,
        carbohydrates REAL    NOT NULL,
        fat           REAL    NOT NULL
      );

      CREATE TABLE Meals (
        id    INTEGER PRIMARY KEY NOT NULL,
        title TEXT    NOT NULL UNIQUE
      );

      CREATE TABLE MealIngredients (
        id            INTEGER PRIMARY KEY NOT NULL,
        meal_id       INTEGER NOT NULL REFERENCES Meals(id) ON DELETE CASCADE,
        ingredient_id INTEGER NOT NULL REFERENCES Ingredients(id) ON DELETE CASCADE,
        grams         REAL    NOT NULL,
        UNIQUE(meal_id, ingredient_id)
      );

      CREATE TABLE IF NOT EXISTS EatenLog (
        id             INTEGER PRIMARY KEY NOT NULL,
        eaten_at       INTEGER NOT NULL DEFAULT (strftime('%s','now')),
        day            TEXT    NOT NULL,
        meal_id        INTEGER REFERENCES Meals(id) ON DELETE CASCADE,
        ingredient_id  INTEGER REFERENCES Ingredients(id) ON DELETE CASCADE,
        kcal_consumed  REAL    NOT NULL DEFAULT 0,
        grams_protein  REAL    NOT NULL DEFAULT 0,
        grams_carbs    REAL    NOT NULL DEFAULT 0,
        grams_fat      REAL    NOT NULL DEFAULT 0,
        CHECK (
          (meal_id IS NOT NULL AND ingredient_id IS NULL)
          OR (meal_id IS NULL AND ingredient_id IS NOT NULL)
        )
      );
      CREATE INDEX IF NOT EXISTS idx_EatenLog_day ON EatenLog(day);

      CREATE VIEW IF NOT EXISTS MealSummaries AS
        SELECT
          m.id,
          m.title,
          ROUND(SUM(i.kcal  * mi.grams / 100.0), 1) AS total_kcal,
          ROUND(SUM(i.proteins * mi.grams / 100.0), 1) AS total_proteins,
          ROUND(SUM(i.carbohydrates * mi.grams / 100.0), 1) AS total_carbs,
          ROUND(SUM(i.fat * mi.grams / 100.0), 1) AS total_fat
        FROM Meals m
        JOIN MealIngredients mi ON mi.meal_id = m.id
        JOIN Ingredients      i  ON i.id        = mi.ingredient_id
        GROUP BY m.id, m.title;

      CREATE VIEW IF NOT EXISTS DailyMacros AS
        SELECT
          day,
          SUM(kcal_consumed)   AS total_kcal,
          SUM(grams_protein)   AS total_protein,
          SUM(grams_carbs)     AS total_carbs,
          SUM(grams_fat)       AS total_fat
        FROM EatenLog
        GROUP BY day;

      CREATE VIEW IF NOT EXISTS MealsEatenByDay AS
        SELECT
          el.id,
          el.eaten_at,
          el.day,
          COALESCE(m.title, i.title) AS title,
          el.kcal_consumed,
          el.grams_protein,
          el.grams_carbs,
          el.grams_fat
        FROM EatenLog el
        LEFT JOIN Meals       m ON m.id = el.meal_id
        LEFT JOIN Ingredients i ON i.id = el.ingredient_id;
    `);
    await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
  }
}