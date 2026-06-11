import { useAuth } from '@clerk/expo'
import { FlashList } from '@shopify/flash-list'
import type { FlashListProps } from '@shopify/flash-list'
import { router, useLocalSearchParams } from 'expo-router'
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { AntDesign } from '@expo/vector-icons'
import { useThemeColor } from '@/hooks/useThemeColor'
import { usePet } from '@/features/pets/api/usePet'
import { useFeedingEvents } from '@/features/feeding/api/useFeedingEvents'
import { useDeleteFeedingEvent } from '@/features/feeding/api/useMutateFeedingEvent'
import { FeedingCard } from '@/features/feeding/components/FeedingCard'
import type { Pet } from '@/features/pets/types'
import type { FoodEvent } from '@/features/feeding/types'

const TypedFlashList = FlashList as React.ComponentType<FlashListProps<FoodEvent> & { estimatedItemSize: number }>

function PetHeader({ pet }: { pet: Pet })
{
  const { icon, iconPrimary } = useThemeColor()

  return (
    <View>
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100 dark:border-gray-700">
        <Pressable onPress={() => router.back()} hitSlop={12} className="mr-3">
          <AntDesign name="arrow-left" size={22} color={icon} />
        </Pressable>
        <Text className="flex-1 text-xl font-semibold text-gray-900 dark:text-white">{pet.name}</Text>
        <Pressable
          onPress={() =>
            router.push({ pathname: '/(protected)/pets/edit', params: { id: pet.id } })}
          hitSlop={12}
        >
          <AntDesign name="edit" size={20} color={iconPrimary} />
        </Pressable>
      </View>

      <View className="mx-4 mt-4 mb-2 bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm">
        <View className="flex-row" style={{ gap: 16 }}>
          {pet.breed
            ? (
                <View className="flex-1">
                  <Text className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide">Breed</Text>
                  <Text className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">{pet.breed}</Text>
                </View>
              )
            : null}
          {pet.weight
            ? (
                <View className="flex-1">
                  <Text className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide">Weight</Text>
                  <Text className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">
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
        <Text className="text-lg font-semibold text-gray-900 dark:text-white">Feeding History</Text>
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
  const insets = useSafeAreaInsets()
  const { activityIndicator } = useThemeColor()

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
      <SafeAreaView className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900" edges={['top', 'left', 'right']}>
        <ActivityIndicator size="large" color={activityIndicator} />
      </SafeAreaView>
    )
  }

  if (!pet)
  {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900" edges={['top', 'left', 'right']}>
        <Text className="text-gray-500 dark:text-gray-400">Pet not found.</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900" edges={['top', 'left', 'right']}>
      {eventsLoading
        ? (
            <View className="flex-1">
              <PetHeader pet={pet} />
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color={activityIndicator} />
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
                  onEdit={() => router.push({
                    pathname: '/(protected)/pets/feeding-edit',
                    params: { eventId: item.id, petId: id },
                  })}
                  onDelete={() => handleDeleteEvent(item.id, item.foodType)}
                />
              )}
              contentContainerStyle={{ padding: 16, paddingTop: 4, paddingBottom: 16 + insets.bottom }}
              ListHeaderComponent={<PetHeader pet={pet} />}
              ListEmptyComponent={(
                <View className="items-center pt-12" style={{ gap: 12 }}>
                  <Text style={{ fontSize: 44 }}>🍽️</Text>
                  <Text className="text-base font-semibold text-gray-700 dark:text-gray-300">No feedings logged</Text>
                  <Text className="text-sm text-gray-400 dark:text-gray-500 text-center">
                    Tap + to log the first feeding
                  </Text>
                </View>
              )}
            />
          )}
    </SafeAreaView>
  )
}
