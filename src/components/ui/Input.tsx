import { Text, TextInput, View } from 'react-native'
import type { TextInputProps } from 'react-native'

interface InputProps extends TextInputProps
{
  label: string
  error?: string | null
  className?: string
}

export const Input = ({ label, error, className = '', ...props }: InputProps) =>
{
  const inputClass = error
    ? 'rounded-xl border border-red-400 bg-red-50 px-4 py-3 text-base text-gray-900'
    : 'rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-900'

  return (
    <View className="gap-1">
      <Text className="text-sm font-medium text-gray-700">{label}</Text>
      <TextInput
        className={`${inputClass} ${className}`}
        placeholderTextColor="#9ca3af"
        {...props}
      />
      {error
        ? <Text className="text-xs text-red-500">{error}</Text>
        : null}
    </View>
  )
}
