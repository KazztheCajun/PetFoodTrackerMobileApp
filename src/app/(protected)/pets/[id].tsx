import { useAuth } from '@clerk/expo'
import { FlashList } from '@shopify/flash-list'
import type { FlashListProps } from '@shopify/flash-list'
import { router, useLocalSearchParams } from 'expo-router'
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AntDesign } from '@expo/vector-icons'
import { usePet } from '@/features/pets/api/usePet'
import { useFeedingEvents } from '@/features/feeding/api/useFeedingEvents'
import { useDeleteFeedingEvent } from '@/features/feeding/api/useMutateFeedingEvent'
import { FeedingCard } from '@/features/feeding/components/FeedingCard'
import type { Pet } from '@/features/pets/types'
import type { FoodEvent } from '@/features/feeding/types'

const TypedFlashList = FlashList as React.ComponentType<FlashListProps<FoodEvent> & { estimatedItemSize: number }>

function PetHeader({ pet }: { pet: Pet })
{
  return (
    <View>
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
        <Pressable onPress={() => router.back()} hitSlop={12} className="mr-3">
          <AntDesign name="arrow-left" size={22} color="#374151" />
        </Pressable>
        <Text className="flex-1 text-xl font-semibold text-gray-900">{pet.name}</Text>
        <Pressable
          onPress={() =>
            router.push({ pathname: '/(protected)/pets/edit', params: { id: pet.id } })}
          hitSlop={12}
        >
          <AntDesign name="edit" size={20} color="#208AEF" />
        </Pressable>
      </View>

      <View className="mx-4 mt-4 mb-2 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <View className="flex-row" style={{ gap: 16 }}>
          {pet.breed
            ? (
                <View className="flex-1">
                  <Text className="text-xs text-gray-400 uppercase tracking-wide">Breed</Text>
                  <Text className="text-sm font-medium text-gray-900 mt-0.5">{pet.breed}</Text>
                </View>
              )
            : null}
          {pet.weight
            ? (
                <View className="flex-1">
                  <Text className="text-xs text-gray-400 uppercase tracking-wide">Weight</Text>
                  <Text className="text-sm font-medium text-gray-900 mt-0.5">
                    {pet.weight}
                    {' '}
                    {pet.weightUnit}
                  </Text>
                </View>
              )
            : null}
        </View>
      </View>

      <View className="flex-row items-center justify-between px-4 py-3">
        <Text className="text-lg font-semibold text-gray-900">Feeding History</Text>
        <Pressable
          onPress={() =>
            router.push({ pathname: '/(protected)/pets/feeding-new', params: { id: pet.id } })}
          className="bg-blue-500 rounded-full w-9 h-9 items-center justify-center"
        >
          <AntDesign name="plus" size={18} color="#fff" />
        </Pressable>
      </View>
    </View>
  )
}

export default function PetDetailScreen()
{
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data: pet, isLoading: petLoading } = usePet(id ?? null)
  const { data: events, isLoading: eventsLoading } = useFeedingEvents(id ?? null)
  const { mutate: deleteEvent } = useDeleteFeedingEvent()

  const handleDeleteEvent = (eventId: string, foodType: string) =>
  {
    Alert.alert(
      'Delete Feeding',
      `Remove the "${foodType}" feeding record?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteEvent({ id: eventId, petId: id }),
        },
      ],
    )
  }

  if (petLoading)
  {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-gray-50" edges={['top', 'left', 'right']}>
        <ActivityIndicator size="large" color="#208AEF" />
      </SafeAreaView>
    )
  }

  if (!pet)
  {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-gray-50" edges={['top', 'left', 'right']}>
        <Text className="text-gray-500">Pet not found.</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top', 'left', 'right']}>
      {eventsLoading
        ? (
            <View className="flex-1">
              <PetHeader pet={pet} />
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#208AEF" />
              </View>
            </View>
          )
        : (
            <TypedFlashList
              estimatedItemSize={80}
              data={events ?? []}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <FeedingCard
                  event={item}
                  onDelete={() => handleDeleteEvent(item.id, item.foodType)}
                />
              )}
              contentContainerStyle={{ padding: 16, paddingTop: 4 }}
              ListHeaderComponent={<PetHeader pet={pet} />}
              ListEmptyComponent={(
                <View className="items-center pt-12" style={{ gap: 12 }}>
                  <Text style={{ fontSize: 44 }}>🍽️</Text>
                  <Text className="text-base font-semibold text-gray-700">No feedings logged</Text>
                  <Text className="text-sm text-gray-400 text-center">
                    Tap + to log the first feeding
                  </Text>
                </View>
              )}
            />
          )}
    </SafeAreaView>
  )
}
