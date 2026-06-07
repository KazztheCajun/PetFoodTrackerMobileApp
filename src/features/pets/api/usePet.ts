import { useQuery } from '@tanstack/react-query'
import { getDb } from '@/db/client'
import { rowToPet, type Pet, type PetRow } from '../types'

export function usePet(id: string | null)
{
  return useQuery<Pet | null>({
    queryKey: ['pets', 'detail', id],
    queryFn: async () =>
    {
      const db = getDb()
      const row = await db.getFirstAsync<PetRow>(
        'SELECT * FROM pets WHERE id = ?',
        [id!],
      )
      return row ? rowToPet(row) : null
    },
    enabled: !!id,
  })
}
