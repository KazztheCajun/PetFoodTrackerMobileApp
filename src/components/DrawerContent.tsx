import { useUser } from '@clerk/expo'
import { router } from 'expo-router'
import { Image, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

interface DrawerRoute
{
  key: string
  name: string
}

interface DrawerDescriptor
{
  options: {
    drawerLabel?: unknown
    title?: string
  }
}

interface DrawerContentProps
{
  state: {
    routes: DrawerRoute[]
    index: number
  }
  navigation: {
    navigate: (name: string) => void
    closeDrawer: () => void
  }
  descriptors: Record<string, DrawerDescriptor>
}

export default function DrawerContent({ state, navigation, descriptors }: DrawerContentProps)
{
  const { user } = useUser()
  const insets = useSafeAreaInsets()

  const initials = [user?.firstName?.[0], user?.lastName?.[0]]
    .filter(Boolean)
    .join('')
    .toUpperCase()
    || user?.primaryEmailAddress?.emailAddress?.[0]?.toUpperCase()
    || '?'

  return (
    <ScrollView
      className="flex-1 bg-white dark:bg-gray-900"
      contentContainerStyle={{ flexGrow: 1, paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700 mb-2">
        <Text className="text-lg font-bold text-gray-900 dark:text-white">Pet Food Tracker</Text>
        <TouchableOpacity onPress={() => { navigation.closeDrawer(); router.push('/(protected)/pets/profile') }} className="rounded-full overflow-hidden">
          {user?.imageUrl
            ? (
                <Image source={{ uri: user.imageUrl }} className="w-10 h-10 rounded-full" />
              )
            : (
                <View className="w-10 h-10 rounded-full bg-blue-500 items-center justify-center">
                  <Text className="text-sm font-bold text-white">{initials}</Text>
                </View>
              )}
        </TouchableOpacity>
      </View>

      {state.routes.map((route, index) =>
      {
        const { options } = descriptors[route.key]
        const label = options.drawerLabel ?? options.title ?? route.name
        const isFocused = state.index === index

        return (
          <Pressable
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            className={`mx-2 my-0.5 px-4 py-3 rounded-xl ${isFocused ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}
          >
            <Text
              className={
                isFocused
                  ? 'text-sm font-semibold text-blue-500'
                  : 'text-sm font-medium text-gray-700 dark:text-gray-300'
              }
            >
              {typeof label === 'string' ? label : route.name}
            </Text>
          </Pressable>
        )
      })}
    </ScrollView>
  )
}
