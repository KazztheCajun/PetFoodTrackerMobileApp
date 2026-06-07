import type { WeightUnit } from '@/constants/units'

export interface Pet
{
  id: string
  userId: string
  name: string
  breed: string | null
  weight: number | null
  weightUnit: WeightUnit
  createdAt: number
  updatedAt: number
}

export interface PetRow
{
  id: string
  user_id: string
  name: string
  breed: string | null
  weight: number | null
  weight_unit: string
  created_at: number
  updated_at: number
}

export function rowToPet(row: PetRow): Pet
{
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    breed: row.breed,
    weight: row.weight,
    weightUnit: row.weight_unit as WeightUnit,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}
