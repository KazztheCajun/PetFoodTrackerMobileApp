import DrawerContent from '@/components/DrawerContent'
import { Drawer } from 'expo-router/drawer'

export default function ProtectedLayout()
{
  return (
    <Drawer drawerContent={(props) => <DrawerContent {...(props as any)} />}>
      <Drawer.Screen
        name="pets"
        options={{
          drawerLabel: 'My Pets',
          headerShown: false,
        }}
      />
    </Drawer>
  )
}
