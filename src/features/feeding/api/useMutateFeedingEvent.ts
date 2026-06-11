import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getDb } from '@/db/client'
import { generateId } from '@/utils/idUtils'
import { toUnixMs } from '@/utils/dateUtils'
import type { FeedingFormValues } from '../schema'

interface CreateFeedingInput extends FeedingFormValues
{
  petId: string
  userId: string
}

export function useCreateFeedingEvent()
{
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ petId, userId, foodType, amount, unit, amountEaten, fedAt, notes }: CreateFeedingInput) =>
    {
      const db = getDb()
      const id = generateId()
      const now = toUnixMs()
      await db.runAsync(
        'INSERT INTO food_events (id, pet_id, user_id, food_type, amount, unit, amount_eaten, fed_at, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [id, petId, userId, foodType, amount, unit, amountEaten ?? null, fedAt, notes ?? null, now],
      )
      return id
    },
    onSuccess: (_, { petId }) =>
    {
      queryClient.invalidateQueries({ queryKey: ['feedingEvents', petId] })
    },
  })
}

interface UpdateFeedingInput extends FeedingFormValues
{
  id: string
  petId: string
  userId: string
}

export function useUpdateFeedingEvent()
{
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, petId, userId, foodType, amount, unit, amountEaten, fedAt, notes }: UpdateFeedingInput) =>
    {
      const db = getDb()
      await db.runAsync(
        'UPDATE food_events SET food_type = ?, amount = ?, unit = ?, amount_eaten = ?, fed_at = ?, notes = ? WHERE id = ? AND user_id = ?',
        [foodType, amount, unit, amountEaten ?? null, fedAt, notes ?? null, id, userId],
      )
      return petId
    },
    onSuccess: (petId) =>
    {
      queryClient.invalidateQueries({ queryKey: ['feedingEvents', petId] })
      queryClient.invalidateQueries({ queryKey: ['feedingEvent'] })
    },
  })
}

export function useDeleteFeedingEvent()
{
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, petId }: { id: string; petId: string }) =>
    {
      const db = getDb()
      await db.runAsync('DELETE FROM food_events WHERE id = ?', [id])
      return petId
    },
    onSuccess: (petId) =>
    {
      queryClient.invalidateQueries({ queryKey: ['feedingEvents', petId] })
    },
  })
}
