import '../../global.css'
import { ClerkProvider, useAuth } from '@clerk/expo'
import { tokenCache } from '@clerk/expo/token-cache'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import { ActivityIndicator, View } from 'react-native'
import { initialWindowMetrics, SafeAreaProvider } from 'react-native-safe-area-context'
import { initializeDatabase } from '@/db/migrations'

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!
if (!publishableKey)
{
  throw new Error('Add your Clerk Publishable Key to the .env.local file')
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 30,
    },
  },
})

function RootLayoutNav()
{
  const { isSignedIn, isLoaded } = useAuth()

  useEffect(() =>
  {
    initializeDatabase().catch(console.error)
  }, [])

  if (!isLoaded)
  {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-gray-900">
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
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <StatusBar style="auto" />
      <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache} treatPendingAsSignedOut={false}>
        <QueryClientProvider client={queryClient}>
          <RootLayoutNav />
        </QueryClientProvider>
      </ClerkProvider>
    </SafeAreaProvider>
  )
}
