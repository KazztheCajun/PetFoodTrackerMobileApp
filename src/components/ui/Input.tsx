import { Text, TextInput, View } from 'react-native'
import type { TextInputProps } from 'react-native'
import { useThemeColor } from '@/hooks/useThemeColor'

interface InputProps extends TextInputProps
{
  label: string
  error?: string | null
  className?: string
}

export const Input = ({ label, error, className = '', ...props }: InputProps) =>
{
  const { placeholder: placeholderColor } = useThemeColor()

  const inputClass = error
    ? 'rounded-xl border border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-base text-gray-900 dark:text-white'
    : 'rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-4 py-3 text-base text-gray-900 dark:text-white'

  return (
    <View className="gap-1">
      <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</Text>
      <TextInput
        className={`${inputClass} ${className}`}
        placeholderTextColor={placeholderColor}
        {...props}
      />
      {error
        ? <Text className="text-xs text-red-500 dark:text-red-400">{error}</Text>
        : null}
    </View>
  )
}
