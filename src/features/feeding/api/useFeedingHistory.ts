import { useQuery } from '@tanstack/react-query'
import { getDb } from '@/db/client'

export interface FeedingHistoryRow
{
  pet_id: string
  fed_at: number
  amount: number
  amount_eaten: number | null
}

export function useFeedingHistory(userId: string | null, startMs: number, endMs: number)
{
  return useQuery<FeedingHistoryRow[]>({
    queryKey: ['feedingHistory', userId, startMs, endMs],
    queryFn: async () =>
    {
      const db = getDb()
      return db.getAllAsync<FeedingHistoryRow>(
        'SELECT pet_id, fed_at, amount, amount_eaten FROM food_events WHERE user_id = ? AND fed_at >= ? AND fed_at < ? ORDER BY fed_at ASC',
        [userId!, startMs, endMs],
      )
    },
    enabled: !!userId,
  })
}
