import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getDb } from '@/db/client'
import { generateId } from '@/utils/idUtils'
import { toUnixMs } from '@/utils/dateUtils'
import type { PetFormValues } from '../schema'

interface CreatePetInput extends PetFormValues
{
  userId: string
}

interface UpdatePetInput extends PetFormValues
{
  id: string
}

export function useCreatePet()
{
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ userId, name, breed, weight, weightUnit }: CreatePetInput) =>
    {
      const db = getDb()
      const now = toUnixMs()
      const id = generateId()
      const resolvedWeight = weight != null && weight !== ('' as any) ? Number(weight) : null
      await db.runAsync(
        'INSERT INTO pets (id, user_id, name, breed, weight, weight_unit, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [id, userId, name, breed ?? null, resolvedWeight, weightUnit, now, now],
      )
      return id
    },
    onSuccess: () =>
    {
      queryClient.invalidateQueries({ queryKey: ['pets'] })
    },
  })
}

export function useUpdatePet()
{
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, name, breed, weight, weightUnit }: UpdatePetInput) =>
    {
      const db = getDb()
      const now = toUnixMs()
      const resolvedWeight = weight != null && weight !== ('' as any) ? Number(weight) : null
      await db.runAsync(
        'UPDATE pets SET name = ?, breed = ?, weight = ?, weight_unit = ?, updated_at = ? WHERE id = ?',
        [name, breed ?? null, resolvedWeight, weightUnit, now, id],
      )
    },
    onSuccess: (_, { id }) =>
    {
      queryClient.invalidateQueries({ queryKey: ['pets'] })
      queryClient.invalidateQueries({ queryKey: ['pets', 'detail', id] })
    },
  })
}

export function useDeletePet()
{
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) =>
    {
      const db = getDb()
      await db.runAsync('DELETE FROM pets WHERE id = ?', [id])
    },
    onSuccess: () =>
    {
      queryClient.invalidateQueries({ queryKey: ['pets'] })
      queryClient.invalidateQueries({ queryKey: ['feedingEvents'] })
    },
  })
}
