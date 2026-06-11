import { useCreatePet } from '@/features/pets/api/useMutatePet'
import { PetForm } from '@/features/pets/components/PetForm'
import type { PetFormValues } from '@/features/pets/schema'
import { useThemeColor } from '@/hooks/useThemeColor'
import { useAuth } from '@clerk/expo'
import { AntDesign } from '@expo/vector-icons'
import { router } from 'expo-router'
import { Alert, KeyboardAvoidingView, Platform, Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function NewPetScreen()
{
  const { userId } = useAuth()
  const { mutateAsync: createPet } = useCreatePet()
  const { icon } = useThemeColor()

  const handleSubmit = async (values: PetFormValues) =>
  {
    if (!userId)
    {
      Alert.alert('Not Signed In', 'You must be signed in to add a pet.')
      return
    }

    try
    {
      await createPet({ ...values, userId })
      router.back()
    }
    catch (error)
    {
      const raw = error instanceof Error ? error.message.toLowerCase() : ''
      const petName = values.name || 'your pet'

      let title = `Couldn't Save ${petName}`
      let message = 'Something went wrong. Please try again.'

      if (raw.includes('no such table') || raw.includes('not initialized'))
      {
        message = 'The database isn\'t ready yet. Please close and reopen the app, then try again.'
      }
      else if (raw.includes('disk') || raw.includes('ioerr') || raw.includes('readonly'))
      {
        message = 'A storage error occurred. Make sure your device has free space and try again.'
      }
      else if (raw.includes('unique constraint'))
      {
        title = 'Duplicate Pet'
        message = `A pet named "${petName}" already exists. Please use a different name.`
      }

      Alert.alert(title, message, [{ text: 'OK' }])
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900" edges={['top', 'bottom', 'left', 'right']}>
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100 dark:border-gray-700">
        <Pressable onPress={() => router.back()} hitSlop={12} className="mr-3">
          <AntDesign name="close" size={22} color={icon} />
        </Pressable>
        <Text className="text-xl font-semibold text-gray-900 dark:text-white">Add Pet</Text>
      </View>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <PetForm onSubmit={handleSubmit} submitLabel="Add Pet" />
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
