import { useAuth } from '@clerk/expo'
import { AuthView } from '@clerk/expo/native'
import { Redirect } from 'expo-router'

export default function SignIn()
{
  const { isSignedIn } = useAuth()

  if (isSignedIn)
  {
    return <Redirect href="/(protected)/pets" />
  }

  return <AuthView mode="signInOrUp" />
}
