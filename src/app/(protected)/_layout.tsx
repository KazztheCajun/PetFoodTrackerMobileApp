import DrawerContent from '@/components/DrawerContent'
import { Drawer } from 'expo-router/drawer'

export default function ProtectedLayout()
{
  return (
    <Drawer drawerContent={(props) => <DrawerContent {...props} />}>
      <Drawer.Screen
        name="pets/[id]"
        options={{
          drawerLabel: 'Home',
          title: 'Home',
          headerShown: false,
        }}
      />
    </Drawer>
  )
}
