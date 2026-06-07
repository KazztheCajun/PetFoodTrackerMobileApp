import { getDb } from './client'
import { CREATE_FOOD_EVENTS_TABLE, CREATE_PETS_TABLE } from './schema'

export async function initializeDatabase(): Promise<void>
{
  const db = getDb()
  await db.execAsync('PRAGMA foreign_keys = ON')
  await db.execAsync(CREATE_PETS_TABLE)
  await db.execAsync(CREATE_FOOD_EVENTS_TABLE)
}
