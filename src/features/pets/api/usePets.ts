import { useQuery } from '@tanstack/react-query'
import { getDb } from '@/db/client'
import { rowToPet, type Pet, type PetRow } from '../types'

export function usePets(userId: string | null)
{
  return useQuery<Pet[]>({
    queryKey: ['pets', userId],
    queryFn: async () =>
    {
      const db = getDb()
      const rows = await db.getAllAsync<PetRow>(
        'SELECT * FROM pets WHERE user_id = ? ORDER BY created_at DESC',
        [userId!],
      )
      return rows.map(rowToPet)
    },
    enabled: !!userId,
  })
}
