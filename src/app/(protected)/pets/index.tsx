import { useAuth } from '@clerk/expo'
import { FlashList } from '@shopify/flash-list'
import { router } from 'expo-router'
import { useContext } from 'react'
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { AntDesign, Feather } from '@expo/vector-icons'
import type { FlashListProps } from '@shopify/flash-list'
import { useThemeColor } from '@/hooks/useThemeColor'
import { PetCard } from '@/features/pets/components/PetCard'
import { usePets } from '@/features/pets/api/usePets'
import { useDeletePet } from '@/features/pets/api/useMutatePet'
import type { Pet } from '@/features/pets/types'

// useContext with NavigationContext never throws; useNavigation() does during concurrent renders
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { NavigationContext } = require('expo-router/build/react-navigation/core')

const TypedFlashList = FlashList as React.ComponentType<FlashListProps<Pet> & { estimatedItemSize: number }>

export default function PetListScreen()
{
  const { userId } = useAuth()
  const { data: pets, isLoading } = usePets(userId ?? null)
  const { mutate: deletePet } = useDeletePet()
  const insets = useSafeAreaInsets()
  const { activityIndicator, icon } = useThemeColor()
  const navigation = useContext(NavigationContext)

  const toggleDrawer = () => navigation?.dispatch({ type: 'TOGGLE_DRAWER' })

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
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900" edges={['top', 'left', 'right']}>
      <View className="flex-row items-center justify-between px-4 py-3">
        <View className="flex-row items-center" style={{ gap: 12 }}>
          <Pressable onPress={toggleDrawer} hitSlop={12}>
            <Feather name="menu" size={24} color={icon} />
          </Pressable>
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">My Pets</Text>
        </View>
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
              <ActivityIndicator size="large" color={activityIndicator} />
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
              contentContainerStyle={{ padding: 16, paddingTop: 4, paddingBottom: 16 + insets.bottom }}
              ListEmptyComponent={(
                <View className="items-center justify-center pt-20" style={{ gap: 12 }}>
                  <Text style={{ fontSize: 52 }}>🐾</Text>
                  <Text className="text-lg font-semibold text-gray-700 dark:text-gray-300">No pets yet</Text>
                  <Text className="text-sm text-gray-400 dark:text-gray-500 text-center px-8">
                    Tap the + button to add your first pet
                  </Text>
                </View>
              )}
            />
          )}
    </SafeAreaView>
  )
}
