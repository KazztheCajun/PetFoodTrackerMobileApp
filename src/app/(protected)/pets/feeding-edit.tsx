import { useAuth } from '@clerk/expo'
import { AntDesign } from '@expo/vector-icons'
import { router, useLocalSearchParams } from 'expo-router'
import { Alert, KeyboardAvoidingView, Platform, Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useFeedingEvent } from '@/features/feeding/api/useFeedingEvents'
import { useUpdateFeedingEvent } from '@/features/feeding/api/useMutateFeedingEvent'
import { FeedingForm, type FeedingFormInitialValues } from '@/features/feeding/components/FeedingForm'
import type { FeedingFormValues } from '@/features/feeding/schema'
import { useThemeColor } from '@/hooks/useThemeColor'

export default function EditFeedingScreen()
{
  const { eventId, petId } = useLocalSearchParams<{ eventId: string; petId: string }>()
  const { userId } = useAuth()
  const { icon } = useThemeColor()
  const { data: event, isLoading } = useFeedingEvent(eventId ?? null, userId ?? null)
  const { mutateAsync: updateFeedingEvent } = useUpdateFeedingEvent()

  const handleSubmit = async (values: FeedingFormValues) =>
  {
    if (!eventId || !petId || !userId) return
    try
    {
      await updateFeedingEvent({ ...values, id: eventId, petId, userId })
      router.back()
    }
    catch
    {
      Alert.alert('Error', 'Failed to update feeding. Please try again.')
    }
  }

  const initialValues: FeedingFormInitialValues | undefined = event
    ? {
        foodType: event.foodType,
        amount: String(event.amount),
        unit: event.unit,
        amountEaten: event.amountEaten != null ? String(event.amountEaten) : '',
        fedAt: event.fedAt,
        notes: event.notes ?? '',
      }
    : undefined

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900" edges={['top', 'bottom', 'left', 'right']}>
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100 dark:border-gray-700">
        <Pressable onPress={() => router.back()} hitSlop={12} className="mr-3">
          <AntDesign name="close" size={22} color={icon} />
        </Pressable>
        <Text className="text-xl font-semibold text-gray-900 dark:text-white">Edit Feeding</Text>
      </View>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {!isLoading && initialValues && (
          <FeedingForm
            onSubmit={handleSubmit}
            initialValues={initialValues}
            submitLabel="Save Changes"
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
