import { useAuth } from '@clerk/expo'
import { router } from 'expo-router'
import { Alert, KeyboardAvoidingView, Platform, Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AntDesign } from '@expo/vector-icons'
import { PetForm } from '@/features/pets/components/PetForm'
import { useCreatePet } from '@/features/pets/api/useMutatePet'
import type { PetFormValues } from '@/features/pets/schema'

export default function NewPetScreen()
{
  const { userId } = useAuth()
  const { mutateAsync: createPet } = useCreatePet()

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
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
        <Pressable onPress={() => router.back()} hitSlop={12} className="mr-3">
          <AntDesign name="close" size={22} color="#374151" />
        </Pressable>
        <Text className="text-xl font-semibold text-gray-900">Add Pet</Text>
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
