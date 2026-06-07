import { z } from 'zod'
import { FOOD_UNITS } from '@/constants/units'

export const feedingSchema = z.object({
  foodType: z.string().min(1, 'Food type is required'),
  amount: z.coerce.number().positive('Amount must be a positive number'),
  unit: z.enum(FOOD_UNITS),
  fedAt: z.number(),
  notes: z.string().optional(),
})

export type FeedingFormValues = z.infer<typeof feedingSchema>
