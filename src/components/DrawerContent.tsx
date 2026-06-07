import { useUser, useUserProfileModal } from '@clerk/expo'
import { Image, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

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
  }
  descriptors: Record<string, DrawerDescriptor>
}

export default function DrawerContent({ state, navigation, descriptors }: DrawerContentProps)
{
  const { user } = useUser()
  const { presentUserProfile } = useUserProfileModal()

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Pet Food Tracker</Text>
        <TouchableOpacity onPress={presentUserProfile} style={styles.avatarButton}>
          {user?.imageUrl
            ? (
                <Image source={{ uri: user.imageUrl }} style={styles.avatar} />
              )
            : (
                <View style={styles.avatarPlaceholder} />
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
            style={[styles.item, isFocused && styles.itemFocused]}
          >
            <Text style={[styles.itemLabel, isFocused && styles.itemLabelFocused]}>
              {typeof label === 'string' ? label : route.name}
            </Text>
          </Pressable>
        )
      })}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  avatarButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
  },
  item: {
    marginHorizontal: 8,
    marginVertical: 2,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  itemFocused: {
    backgroundColor: '#e8f0fe',
  },
  itemLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  itemLabelFocused: {
    color: '#208AEF',
    fontWeight: '600',
  },
})
