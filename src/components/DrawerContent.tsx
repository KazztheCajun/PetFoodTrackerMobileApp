import { useUser, useUserProfileModal } from '@clerk/expo'
import type { DrawerContentComponentProps } from '@react-navigation/drawer'
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer'
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

export default function DrawerContent(props: DrawerContentComponentProps)
{
  const { user } = useUser()
  const { presentUserProfile } = useUserProfileModal()

  return (
    <DrawerContentScrollView {...props}>
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
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  )
}

const styles = StyleSheet.create({
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
})
