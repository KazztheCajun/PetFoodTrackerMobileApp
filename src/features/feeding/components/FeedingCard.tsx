import { AntDesign, Feather } from '@expo/vector-icons'
import { Pressable, Text, View } from 'react-native'
import { useThemeColor } from '@/hooks/useThemeColor'
import { formatFedAt } from '@/utils/dateUtils'
import type { FoodEvent } from '../types'

interface FeedingCardProps
{
  event: FoodEvent
  onEdit: () => void
  onDelete: () => void
}

export const FeedingCard = ({ event, onEdit, onDelete }: FeedingCardProps) =>
{
  const { icon, iconDanger } = useThemeColor()

  return (
    <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-3 border border-gray-100 dark:border-gray-700 shadow-sm flex-row items-start justify-between">
      <View className="flex-1">
        <Text className="text-base font-semibold text-gray-900 dark:text-white">{event.foodType}</Text>
        <View className="flex-row items-center gap-2 mt-0.5 flex-wrap">
          <Text className="text-sm text-blue-500">
            {event.amount}
            {' '}
            {event.unit}
            {' '}
            served
          </Text>
          {event.amountEaten != null
            ? (
                <Text className="text-sm text-green-500">
                  {event.amountEaten}
                  {' '}
                  {event.unit}
                  {' '}
                  eaten
                </Text>
              )
            : null}
        </View>
        {event.notes
          ? <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">{event.notes}</Text>
          : null}
        <Text className="text-xs text-gray-400 dark:text-gray-500 mt-1">{formatFedAt(event.fedAt)}</Text>
      </View>
      <View className="flex-row items-center gap-1 ml-2">
        <Pressable onPress={onEdit} hitSlop={12} className="p-2">
          <Feather name="edit-2" size={15} color={icon} />
        </Pressable>
        <Pressable onPress={onDelete} hitSlop={12} className="p-2">
          <AntDesign name="delete" size={15} color={iconDanger} />
        </Pressable>
      </View>
    </View>
  )
}
