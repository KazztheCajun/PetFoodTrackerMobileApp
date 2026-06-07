import { AntDesign } from '@expo/vector-icons'
import { Pressable, Text, View } from 'react-native'
import type { Pet } from '../types'

interface PetCardProps
{
  pet: Pet
  onPress: () => void
  onDelete: () => void
}

export const PetCard = ({ pet, onPress, onDelete }: PetCardProps) =>
{
  return (
    <Pressable
      onPress={onPress}
      className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100 flex-row items-center justify-between"
    >
      <View className="flex-1">
        <Text className="text-lg font-semibold text-gray-900">{pet.name}</Text>
        {pet.breed
          ? <Text className="text-sm text-gray-500 mt-0.5">{pet.breed}</Text>
          : null}
        {pet.weight
          ? (
              <Text className="text-sm text-blue-500 mt-1">
                {pet.weight}
                {' '}
                {pet.weightUnit}
              </Text>
            )
          : null}
      </View>
      <Pressable onPress={onDelete} hitSlop={12} className="p-2 ml-2">
        <AntDesign name="delete" size={18} color="#ef4444" />
      </Pressable>
    </Pressable>
  )
}
