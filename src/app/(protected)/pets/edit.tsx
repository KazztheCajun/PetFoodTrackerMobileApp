import { router, useLocalSearchParams } from 'expo-router'
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AntDesign } from '@expo/vector-icons'
import { PetForm } from '@/features/pets/components/PetForm'
import { usePet } from '@/features/pets/api/usePet'
import { useUpdatePet } from '@/features/pets/api/useMutatePet'
import type { PetFormValues } from '@/features/pets/schema'

export default function EditPetScreen()
{
  const { id } = useLocalSearchParams<{ id: string }>()
  const { data: pet, isLoading } = usePet(id ?? null)
  const { mutateAsync: updatePet } = useUpdatePet()

  const handleSubmit = async (values: PetFormValues) =>
  {
    if (!id) return
    try
    {
      await updatePet({ ...values, id })
      router.back()
    }
    catch
    {
      Alert.alert('Error', 'Failed to save changes. Please try again.')
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
        <Pressable onPress={() => router.back()} hitSlop={12} className="mr-3">
          <AntDesign name="close" size={22} color="#374151" />
        </Pressable>
        <Text className="text-xl font-semibold text-gray-900">Edit Pet</Text>
      </View>

      {isLoading
        ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#208AEF" />
            </View>
          )
        : pet
          ? (
              <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              >
                <PetForm
                  defaultValues={{
                    name: pet.name,
                    breed: pet.breed ?? '',
                    weight: pet.weight ?? ('' as any),
                    weightUnit: pet.weightUnit,
                  }}
                  onSubmit={handleSubmit}
                  submitLabel="Save Changes"
                />
              </KeyboardAvoidingView>
            )
          : (
              <View className="flex-1 items-center justify-center">
                <Text className="text-gray-500">Pet not found.</Text>
              </View>
            )}
    </SafeAreaView>
  )
}
