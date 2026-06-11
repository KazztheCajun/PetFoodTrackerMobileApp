export const CREATE_PETS_TABLE = `
  CREATE TABLE IF NOT EXISTS pets (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    breed TEXT,
    weight REAL,
    weight_unit TEXT NOT NULL DEFAULT 'lbs',
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )
`

export const CREATE_FOOD_EVENTS_TABLE = `
  CREATE TABLE IF NOT EXISTS food_events (
    id TEXT PRIMARY KEY,
    pet_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    food_type TEXT NOT NULL,
    amount REAL NOT NULL,
    unit TEXT NOT NULL,
    amount_eaten REAL,
    fed_at INTEGER NOT NULL,
    notes TEXT,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE
  )
`
