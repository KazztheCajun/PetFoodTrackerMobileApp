import { Stack } from 'expo-router'

export default function PetsLayout()
{
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" />
      <Stack.Screen name="new" options={{ presentation: 'modal' }} />
      <Stack.Screen name="edit" options={{ presentation: 'modal' }} />
      <Stack.Screen name="feeding-new" options={{ presentation: 'modal' }} />
    </Stack>
  )
}
