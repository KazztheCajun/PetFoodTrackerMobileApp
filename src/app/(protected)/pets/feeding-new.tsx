import { useAuth } from '@clerk/expo'
import { router, useLocalSearchParams } from 'expo-router'
import { Alert, KeyboardAvoidingView, Platform, Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AntDesign } from '@expo/vector-icons'
import { FeedingForm } from '@/features/feeding/components/FeedingForm'
import { useCreateFeedingEvent } from '@/features/feeding/api/useMutateFeedingEvent'
import type { FeedingFormValues } from '@/features/feeding/schema'

export default function NewFeedingScreen()
{
  const { id: petId } = useLocalSearchParams<{ id: string }>()
  const { userId } = useAuth()
  const { mutateAsync: createFeedingEvent } = useCreateFeedingEvent()

  const handleSubmit = async (values: FeedingFormValues) =>
  {
    if (!petId || !userId) return
    try
    {
      await createFeedingEvent({ ...values, petId, userId })
      router.back()
    }
    catch
    {
      Alert.alert('Error', 'Failed to log feeding. Please try again.')
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
        <Pressable onPress={() => router.back()} hitSlop={12} className="mr-3">
          <AntDesign name="close" size={22} color="#374151" />
        </Pressable>
        <Text className="text-xl font-semibold text-gray-900">Log Feeding</Text>
      </View>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <FeedingForm onSubmit={handleSubmit} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
