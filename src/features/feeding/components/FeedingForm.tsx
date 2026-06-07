import { useForm } from '@tanstack/react-form'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { FOOD_UNITS } from '@/constants/units'
import { toUnixMs } from '@/utils/dateUtils'
import type { FeedingFormValues } from '../schema'

interface FeedingFormProps
{
  onSubmit: (values: FeedingFormValues) => Promise<void>
}

export const FeedingForm = ({ onSubmit }: FeedingFormProps) =>
{
  const form = useForm({
    defaultValues: {
      foodType: '',
      amount: '',
      unit: 'cups' as typeof FOOD_UNITS[number],
      fedAt: toUnixMs(),
      notes: '',
    },
    onSubmit: async ({ value }) =>
    {
      await onSubmit({
        foodType: value.foodType,
        amount: Number(value.amount),
        unit: value.unit,
        fedAt: value.fedAt,
        notes: value.notes,
      } as FeedingFormValues)
    },
  })

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ gap: 16, padding: 16, paddingBottom: 32 }}
      keyboardShouldPersistTaps="handled"
    >
      <form.Field
        name="foodType"
        validators={{
          onChange: ({ value }) => (!value?.trim() ? 'Food type is required' : undefined),
        }}
      >
        {(field) => (
          <Input
            label="Food Type *"
            value={field.state.value}
            onChangeText={(text) => field.handleChange(text)}
            onBlur={field.handleBlur}
            placeholder="e.g. Dry kibble, Wet food"
            error={field.state.meta.isTouched ? (field.state.meta.errors[0] as string | undefined) : null}
          />
        )}
      </form.Field>

      <form.Field
        name="amount"
        validators={{
          onChange: ({ value }) =>
          {
            const num = Number(value)
            if (!value || Number.isNaN(num) || num <= 0) return 'Amount must be a positive number'
            return undefined
          },
        }}
      >
        {(field) => (
          <Input
            label="Amount *"
            value={field.state.value ?? ''}
            onChangeText={(text) => field.handleChange(text)}
            onBlur={field.handleBlur}
            placeholder="e.g. 1.5"
            keyboardType="decimal-pad"
            error={field.state.meta.isTouched ? (field.state.meta.errors[0] as string | undefined) : null}
          />
        )}
      </form.Field>

      <form.Field name="unit">
        {(field) => (
          <View style={{ gap: 4 }}>
            <Text className="text-sm font-medium text-gray-700">Unit</Text>
            <View className="flex-row flex-wrap gap-2">
              {FOOD_UNITS.map((unit) => (
                <Pressable
                  key={unit}
                  onPress={() => field.handleChange(unit)}
                  className={`px-4 py-2 rounded-xl border ${
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

      <form.Field name="notes">
        {(field) => (
          <Input
            label="Notes (optional)"
            value={field.state.value ?? ''}
            onChangeText={(text) => field.handleChange(text)}
            placeholder="e.g. Ate all of it"
            multiline
            numberOfLines={2}
          />
        )}
      </form.Field>

      <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
        {([canSubmit, isSubmitting]) => (
          <Button
            label="Log Feeding"
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
