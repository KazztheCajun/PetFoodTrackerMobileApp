import { useColorScheme } from 'react-native'

export function useThemeColor()
{
  const scheme = useColorScheme()
  const isDark = scheme === 'dark'

  return {
    isDark,
    icon: isDark ? '#d1d5db' : '#374151',
    iconPrimary: '#208AEF',
    iconDanger: '#ef4444',
    placeholder: isDark ? '#6b7280' : '#9ca3af',
    activityIndicator: isDark ? '#60a5fa' : '#208AEF',
  }
}
