import { useForm } from '@tanstack/react-form'
import { Feather } from '@expo/vector-icons'
import { requireOptionalNativeModule } from 'expo-modules-core'
import { useState } from 'react'
import { Platform, Pressable, ScrollView, Text, View } from 'react-native'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { FOOD_UNITS } from '@/constants/units'
import { useThemeColor } from '@/hooks/useThemeColor'
import { toUnixMs } from '@/utils/dateUtils'
import type { FeedingFormValues } from '../schema'

// Returns null in builds where the native date picker module isn't compiled in (e.g. Expo Go)
const nativeDatePicker = requireOptionalNativeModule('RNCDatePicker')

const ONE_DAY_MS = 24 * 60 * 60 * 1000

function formatDate(ms: number): string
{
  return new Date(ms).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function shiftDate(ms: number, days: number): number
{
  const d = new Date(ms)
  d.setDate(d.getDate() + days)
  return d.getTime()
}

export interface FeedingFormInitialValues
{
  foodType: string
  amount: string
  unit: typeof FOOD_UNITS[number]
  amountEaten: string
  fedAt: number
  notes: string
}

interface FeedingFormProps
{
  onSubmit: (values: FeedingFormValues) => Promise<void>
  initialValues?: FeedingFormInitialValues
  submitLabel?: string
}

export const FeedingForm = ({ onSubmit, initialValues, submitLabel = 'Log Feeding' }: FeedingFormProps) =>
{
  const { icon } = useThemeColor()
  const [showDatePicker, setShowDatePicker] = useState(false)
  const today = new Date(); today.setHours(23, 59, 59, 999)
  const todayMs = today.getTime()

  const form = useForm({
    defaultValues: initialValues ?? {
      foodType: '',
      amount: '',
      unit: 'cups' as typeof FOOD_UNITS[number],
      amountEaten: '',
      fedAt: toUnixMs(),
      notes: '',
    },
    onSubmit: async ({ value }) =>
    {
      const eaten = value.amountEaten !== '' ? Number(value.amountEaten) : null
      await onSubmit({
        foodType: value.foodType,
        amount: Number(value.amount),
        unit: value.unit,
        amountEaten: eaten && eaten > 0 ? eaten : null,
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
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">Unit</Text>
            <View className="flex-row flex-wrap gap-2">
              {FOOD_UNITS.map((unit) => (
                <Pressable
                  key={unit}
                  onPress={() => field.handleChange(unit)}
                  className={`px-4 py-2 rounded-xl border ${
                    field.state.value === unit
                      ? 'bg-blue-500 border-blue-500'
                      : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                  }`}
                >
                  <Text
                    className={
                      field.state.value === unit
                        ? 'text-white font-semibold'
                        : 'text-gray-700 dark:text-gray-300'
                    }
                  >
                    {unit}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </form.Field>

      <form.Field
        name="amountEaten"
        validators={{
          onChange: ({ value }) =>
          {
            if (!value) return undefined
            const num = Number(value)
            if (Number.isNaN(num) || num < 0) return 'Must be a positive number'
            return undefined
          },
        }}
      >
        {(field) => (
          <Input
            label="Amount Eaten (optional)"
            value={field.state.value ?? ''}
            onChangeText={(text) => field.handleChange(text)}
            onBlur={field.handleBlur}
            placeholder="e.g. 1.2"
            keyboardType="decimal-pad"
            error={field.state.meta.isTouched ? (field.state.meta.errors[0] as string | undefined) : null}
          />
        )}
      </form.Field>

      <form.Field name="fedAt">
        {(field) =>
        {
          const currentDate = new Date(field.state.value)
          const isFuture = field.state.value > todayMs

          // ── Native picker (EAS builds) ────────────────────────────────────
          if (nativeDatePicker)
          {
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const DateTimePicker = require('@react-native-community/datetimepicker').default

            const handleNativeChange = (event: { type: string }, selected?: Date) =>
            {
              if (Platform.OS === 'android')
              {
                setShowDatePicker(false)
                if (event.type === 'set' && selected)
                {
                  const updated = new Date(field.state.value)
                  updated.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate())
                  field.handleChange(updated.getTime())
                }
              }
              else if (selected)
              {
                const updated = new Date(field.state.value)
                updated.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate())
                field.handleChange(updated.getTime())
              }
            }

            return (
              <View style={{ gap: 4 }}>
                <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">Date</Text>
                <Pressable
                  onPress={() => setShowDatePicker((prev) => !prev)}
                  className="flex-row items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600"
                >
                  <Text className="text-sm text-gray-900 dark:text-gray-100">{formatDate(field.state.value)}</Text>
                  <Feather name="calendar" size={16} color={icon} />
                </Pressable>
                {showDatePicker && (
                  <>
                    <DateTimePicker
                      value={currentDate}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'inline' : 'default'}
                      maximumDate={new Date()}
                      onChange={handleNativeChange}
                    />
                    {Platform.OS === 'ios' && (
                      <Pressable onPress={() => setShowDatePicker(false)} className="items-end py-1">
                        <Text className="text-blue-500 text-sm font-semibold">Done</Text>
                      </Pressable>
                    )}
                  </>
                )}
              </View>
            )
          }

          // ── JS fallback (Expo Go / builds without native picker) ──────────
          return (
            <View style={{ gap: 4 }}>
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">Date</Text>
              <View className="flex-row items-center bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 overflow-hidden">
                <Pressable
                  onPress={() => field.handleChange(shiftDate(field.state.value, -1))}
                  className="px-4 py-3 items-center justify-center"
                  hitSlop={8}
                >
                  <Feather name="chevron-left" size={18} color={icon} />
                </Pressable>
                <Text className="flex-1 text-center text-sm text-gray-900 dark:text-gray-100">
                  {formatDate(field.state.value)}
                </Text>
                <Pressable
                  onPress={() => !isFuture && field.handleChange(shiftDate(field.state.value, 1))}
                  className="px-4 py-3 items-center justify-center"
                  hitSlop={8}
                  style={{ opacity: isFuture ? 0.3 : 1 }}
                >
                  <Feather name="chevron-right" size={18} color={icon} />
                </Pressable>
              </View>
              <Text className="text-xs text-gray-400 dark:text-gray-500">
                Tap arrows to change the date
              </Text>
            </View>
          )
        }}
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
