import { useForm } from '@tanstack/react-form'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { WEIGHT_UNITS } from '@/constants/units'
import type { PetFormValues } from '../schema'

interface PetFormProps
{
  defaultValues?: Partial<PetFormValues>
  onSubmit: (values: PetFormValues) => Promise<void>
  submitLabel?: string
}

export const PetForm = ({ defaultValues, onSubmit, submitLabel = 'Save' }: PetFormProps) =>
{
  const form = useForm({
    defaultValues: {
      name: defaultValues?.name ?? '',
      breed: defaultValues?.breed ?? '',
      weight: String(defaultValues?.weight ?? ''),
      weightUnit: defaultValues?.weightUnit ?? ('lbs' as 'lbs' | 'kg'),
    },
    onSubmit: async ({ value }) =>
    {
      await onSubmit({
        name: value.name,
        breed: value.breed,
        weight: value.weight ? Number(value.weight) as any : undefined,
        weightUnit: value.weightUnit,
      })
    },
  })

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ gap: 16, padding: 16, paddingBottom: 32 }}
      keyboardShouldPersistTaps="handled"
    >
      <form.Field
        name="name"
        validators={{
          onChange: ({ value }) => (!value?.trim() ? 'Name is required' : undefined),
        }}
      >
        {(field) => (
          <Input
            label="Pet Name *"
            value={field.state.value}
            onChangeText={(text) => field.handleChange(text)}
            onBlur={field.handleBlur}
            placeholder="e.g. Buddy"
            error={field.state.meta.isTouched ? (field.state.meta.errors[0] as string | undefined) : null}
          />
        )}
      </form.Field>

      <form.Field name="breed">
        {(field) => (
          <Input
            label="Breed"
            value={field.state.value ?? ''}
            onChangeText={(text) => field.handleChange(text)}
            placeholder="e.g. Golden Retriever"
          />
        )}
      </form.Field>

      <form.Field
        name="weight"
        validators={{
          onChange: ({ value }) =>
          {
            if (!value) return undefined
            const num = Number(value)
            if (Number.isNaN(num) || num <= 0) return 'Weight must be a positive number'
            return undefined
          },
        }}
      >
        {(field) => (
          <Input
            label="Weight"
            value={field.state.value ?? ''}
            onChangeText={(text) => field.handleChange(text)}
            placeholder="e.g. 25"
            keyboardType="decimal-pad"
            error={field.state.meta.isTouched ? (field.state.meta.errors[0] as string | undefined) : null}
          />
        )}
      </form.Field>

      <form.Field name="weightUnit">
        {(field) => (
          <View style={{ gap: 4 }}>
            <Text className="text-sm font-medium text-gray-700">Weight Unit</Text>
            <View className="flex-row gap-2">
              {WEIGHT_UNITS.map((unit) => (
                <Pressable
                  key={unit}
                  onPress={() => field.handleChange(unit)}
                  className={`flex-1 py-3 rounded-xl border items-center ${
                    field.state.value === unit
                      ? 'bg-blue-500 border-blue-500'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <Text
                    className={field.state.value === unit ? 'text-white font-semibold' : 'text-gray-700'}
                  >
                    {unit}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </form.Field>

      <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
        {([canSubmit, isSubmitting]) => (
          <Button
            label={submitLabel}
            onPress={form.handleSubmit}
            loading={isSubmitting as boolean}
            disabled={!(canSubmit as boolean)}
            fullWidth
          />
        )}
      </form.Subscribe>
    </ScrollView>
  )
}
