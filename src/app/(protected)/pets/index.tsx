import { useAuth } from '@clerk/expo'
import { FlashList } from '@shopify/flash-list'
import { router } from 'expo-router'
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AntDesign } from '@expo/vector-icons'
import type { FlashListProps } from '@shopify/flash-list'
import { PetCard } from '@/features/pets/components/PetCard'
import { usePets } from '@/features/pets/api/usePets'
import { useDeletePet } from '@/features/pets/api/useMutatePet'
import type { Pet } from '@/features/pets/types'

const TypedFlashList = FlashList as React.ComponentType<FlashListProps<Pet> & { estimatedItemSize: number }>

export default function PetListScreen()
{
  const { userId } = useAuth()
  const { data: pets, isLoading } = usePets(userId ?? null)
  const { mutate: deletePet } = useDeletePet()

  const handleDelete = (id: string, name: string) =>
  {
    Alert.alert(
      'Remove Pet',
      `Are you sure you want to remove ${name}? All feeding history will be deleted.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => deletePet(id) },
      ],
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top', 'left', 'right']}>
      <View className="flex-row items-center justify-between px-4 py-3">
        <Text className="text-2xl font-bold text-gray-900">My Pets</Text>
        <Pressable
          onPress={() => router.push('/(protected)/pets/new')}
          className="bg-blue-500 rounded-full w-10 h-10 items-center justify-center"
        >
          <AntDesign name="plus" size={20} color="#fff" />
        </Pressable>
      </View>

      {isLoading
        ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#208AEF" />
            </View>
          )
        : (
            <TypedFlashList
              estimatedItemSize={88}
              data={pets ?? []}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <PetCard
                  pet={item}
                  onPress={() =>
                    router.push({
                      pathname: '/(protected)/pets/[id]',
                      params: { id: item.id },
                    })}
                  onDelete={() => handleDelete(item.id, item.name)}
                />
              )}
              contentContainerStyle={{ padding: 16, paddingTop: 4 }}
              ListEmptyComponent={(
                <View className="items-center justify-center pt-20" style={{ gap: 12 }}>
                  <Text style={{ fontSize: 52 }}>🐾</Text>
                  <Text className="text-lg font-semibold text-gray-700">No pets yet</Text>
                  <Text className="text-sm text-gray-400 text-center px-8">
                    Tap the + button to add your first pet
                  </Text>
                </View>
              )}
            />
          )}
    </SafeAreaView>
  )
}
