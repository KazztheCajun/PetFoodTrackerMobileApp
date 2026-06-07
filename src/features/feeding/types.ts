import type { FoodUnit } from '@/constants/units'

export interface FoodEvent
{
  id: string
  petId: string
  userId: string
  foodType: string
  amount: number
  unit: FoodUnit
  fedAt: number
  notes: string | null
  createdAt: number
}

export interface FoodEventRow
{
  id: string
  pet_id: string
  user_id: string
  food_type: string
  amount: number
  unit: string
  fed_at: number
  notes: string | null
  created_at: number
}

export function rowToFoodEvent(row: FoodEventRow): FoodEvent
{
  return {
    id: row.id,
    petId: row.pet_id,
    userId: row.user_id,
    foodType: row.food_type,
    amount: row.amount,
    unit: row.unit as FoodUnit,
    fedAt: row.fed_at,
    notes: row.notes,
    createdAt: row.created_at,
  }
}
