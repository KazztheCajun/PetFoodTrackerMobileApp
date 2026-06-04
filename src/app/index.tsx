import { useAuth, useClerk, useUser, useUserProfileModal } from '@clerk/expo'
import { AuthView, UserButton } from '@clerk/expo/native'
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

export default function Index()
{
  const { isSignedIn, isLoaded } = useAuth({ treatPendingAsSignedOut: false })
  const { user } = useUser()
  const { signOut } = useClerk()
  const { presentUserProfile } = useUserProfileModal()

  if (!isLoaded)
  {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (!isSignedIn)
  {
    return <AuthView mode="signInOrUp" />
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome</Text>
        <View style={styles.userButtonWrapper}>
          <UserButton />
        </View>
      </View>
      <View style={styles.profileCard}>
        {user?.imageUrl && <Image source={{ uri: user.imageUrl }} style={styles.avatar} />}
        <Text>Hello, {user?.id}</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={presentUserProfile}>
        <Text style={styles.buttonText}>Manage Profile</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={() => signOut()}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  userButtonWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: '#666',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})
