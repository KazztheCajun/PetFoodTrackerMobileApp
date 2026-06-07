export const WEIGHT_UNITS = ['lbs', 'kg'] as const
export type WeightUnit = (typeof WEIGHT_UNITS)[number]

export const FOOD_UNITS = ['cups', 'oz', 'g', 'ml', 'lbs'] as const
export type FoodUnit = (typeof FOOD_UNITS)[number]
