import { useLocalSearchParams } from 'expo-router'
import { Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function Homescreen()
{
  const { id } = useLocalSearchParams<{ id: string }>()

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, padding: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Home</Text>
        <Text style={{ marginTop: 8, color: '#666' }}>id: {id}</Text>
      </View>
    </SafeAreaView>
  )
}
