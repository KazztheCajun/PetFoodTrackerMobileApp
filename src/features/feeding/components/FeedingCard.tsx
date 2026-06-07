import { AntDesign } from '@expo/vector-icons'
import { Pressable, Text, View } from 'react-native'
import { formatFedAt } from '@/utils/dateUtils'
import type { FoodEvent } from '../types'

interface FeedingCardProps
{
  event: FoodEvent
  onDelete: () => void
}

export const FeedingCard = ({ event, onDelete }: FeedingCardProps) =>
{
  return (
    <View className="bg-white rounded-2xl p-4 mb-3 border border-gray-100 shadow-sm flex-row items-start justify-between">
      <View className="flex-1">
        <Text className="text-base font-semibold text-gray-900">{event.foodType}</Text>
        <Text className="text-sm text-blue-500 mt-0.5">
          {event.amount}
          {' '}
          {event.unit}
        </Text>
        {event.notes
          ? <Text className="text-sm text-gray-500 mt-1">{event.notes}</Text>
          : null}
        <Text className="text-xs text-gray-400 mt-1">{formatFedAt(event.fedAt)}</Text>
      </View>
      <Pressable onPress={onDelete} hitSlop={12} className="p-2 ml-2">
        <AntDesign name="delete" size={16} color="#ef4444" />
      </Pressable>
    </View>
  )
}
