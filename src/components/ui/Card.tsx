import { View } from 'react-native'
import type { ViewProps } from 'react-native'

interface CardProps extends ViewProps
{
  children: React.ReactNode
  className?: string
}

export const Card = ({ children, className = '', ...props }: CardProps) =>
{
  return (
    <View
      className={`bg-white rounded-2xl p-4 shadow-sm border border-gray-100 ${className}`}
      {...props}
    >
      {children}
    </View>
  )
}
