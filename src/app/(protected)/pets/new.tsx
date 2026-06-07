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
    if (!userId) return
    try
    {
      await createPet({ ...values, userId })
      router.back()
    }
    catch
    {
      Alert.alert('Error', 'Failed to add pet. Please try again.')
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
