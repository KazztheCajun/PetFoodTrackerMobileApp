import { ClerkProvider, useAuth } from '@clerk/expo'
import { tokenCache } from '@clerk/expo/token-cache'
import { Stack } from 'expo-router'
import { ActivityIndicator, View } from 'react-native'
import { initialWindowMetrics, SafeAreaProvider } from 'react-native-safe-area-context'

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!
if (!publishableKey)
{
  throw new Error('Add your Clerk Publishable Key to the .env.local file')
}

function RootLayoutNav()
{
  const { isSignedIn, isLoaded } = useAuth()

  if (!isLoaded)
  {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Protected guard={!!isSignedIn}>
        <Stack.Screen name="(protected)" />
      </Stack.Protected>
    </Stack>
  )
}

export default function RootLayout()
{
  return (
    <SafeAreaProvider initialWindowMetrics={initialWindowMetrics}>
      <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
        <RootLayoutNav />
      </ClerkProvider>
    </SafeAreaProvider>
  )
}
