import { ActivityIndicator, Pressable, Text } from 'react-native'

interface ButtonProps
{
  label: string
  onPress: () => void
  variant?: 'primary' | 'secondary' | 'destructive'
  loading?: boolean
  disabled?: boolean
  fullWidth?: boolean
}

const variantContainer = {
  primary: 'bg-blue-500',
  secondary: 'bg-gray-100 border border-gray-200',
  destructive: 'bg-red-500',
}

const variantText = {
  primary: 'text-white',
  secondary: 'text-gray-700',
  destructive: 'text-white',
}

export const Button = ({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  fullWidth = false,
}: ButtonProps) =>
{
  const isDisabled = disabled || loading

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={`flex-row items-center justify-center rounded-xl px-6 py-3 ${variantContainer[variant]} ${fullWidth ? 'w-full' : ''} ${isDisabled ? 'opacity-50' : ''}`}
    >
      {loading
        ? (
            <ActivityIndicator size="small" color={variant === 'secondary' ? '#374151' : '#fff'} />
          )
        : (
            <Text className={`text-base font-semibold ${variantText[variant]}`}>
              {label}
            </Text>
          )}
    </Pressable>
  )
}
