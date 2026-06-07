import { z } from 'zod'
import { WEIGHT_UNITS } from '@/constants/units'

export const petSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  breed: z.string().optional(),
  weight: z.union([
    z.coerce.number().positive('Weight must be a positive number'),
    z.literal(''),
  ]).optional(),
  weightUnit: z.enum(WEIGHT_UNITS),
})

export type PetFormValues = z.infer<typeof petSchema>
