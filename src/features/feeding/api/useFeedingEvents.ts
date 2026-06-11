import { useQuery } from '@tanstack/react-query'
import { getDb } from '@/db/client'
import { rowToFoodEvent, type FoodEvent, type FoodEventRow } from '../types'

export function useFeedingEvents(petId: string | null)
{
  return useQuery<FoodEvent[]>({
    queryKey: ['feedingEvents', petId],
    queryFn: async () =>
    {
      const db = getDb()
      const rows = await db.getAllAsync<FoodEventRow>(
        'SELECT * FROM food_events WHERE pet_id = ? ORDER BY fed_at DESC',
        [petId!],
      )
      return rows.map(rowToFoodEvent)
    },
    enabled: !!petId,
  })
}

export function useFeedingEvent(eventId: string | null, userId: string | null)
{
  return useQuery<FoodEvent | null>({
    queryKey: ['feedingEvent', eventId],
    queryFn: async () =>
    {
      const db = getDb()
      const row = await db.getFirstAsync<FoodEventRow>(
        'SELECT * FROM food_events WHERE id = ? AND user_id = ?',
        [eventId!, userId!],
      )
      return row ? rowToFoodEvent(row) : null
    },
    enabled: !!eventId && !!userId,
  })
}
