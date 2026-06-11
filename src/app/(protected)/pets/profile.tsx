import { useAuth, useUser } from '@clerk/expo'
import { AntDesign, Feather } from '@expo/vector-icons'
import { requireOptionalNativeModule } from 'expo-modules-core'
import { router } from 'expo-router'
import React, { useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useThemeColor } from '@/hooks/useThemeColor'

// Returns null if ExponentImagePicker native module is not registered in this build.
// Works without throwing in Expo Go, dev builds, and production builds.
const nativeImagePicker = requireOptionalNativeModule('ExponentImagePicker')

type ActivePanel = null | 'editName' | 'changePassword'

const SectionHeader = ({ title }: { title: string }) =>
{
  return (
    <Text className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-4 pt-6 pb-2">
      {title}
    </Text>
  )
}

const SettingsRow = ({
  label,
  value,
  onPress,
  icon,
  destructive = false,
}: {
  label: string
  value?: string
  onPress?: () => void
  icon?: React.ReactNode
  destructive?: boolean
}) =>
{
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      className="flex-row items-center px-4 py-3.5 border-b border-gray-100 dark:border-gray-700/60"
    >
      {icon && <View className="mr-3">{icon}</View>}
      <Text className={`flex-1 text-sm font-medium ${destructive ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
        {label}
      </Text>
      {value
        ? <Text className="text-sm text-gray-400 dark:text-gray-500 mr-2" numberOfLines={1}>{value}</Text>
        : null}
      {onPress && !destructive
        ? <AntDesign name="right" size={14} color="#9ca3af" />
        : null}
    </Pressable>
  )
}

const ProfileScreen = () =>
{
  const { user, isLoaded } = useUser()
  const { signOut } = useAuth()
  const { icon, placeholder } = useThemeColor()

  const [activePanel, setActivePanel] = useState<ActivePanel>(null)
  const [saving, setSaving] = useState(false)
  const [panelError, setPanelError] = useState<string | null>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  const [firstName, setFirstName] = useState(user?.firstName ?? '')
  const [lastName, setLastName] = useState(user?.lastName ?? '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const openPanel = (panel: ActivePanel) =>
  {
    setPanelError(null)
    if (panel === 'editName')
    {
      setFirstName(user?.firstName ?? '')
      setLastName(user?.lastName ?? '')
    }
    else if (panel === 'changePassword')
    {
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }
    setActivePanel(prev => (prev === panel ? null : panel))
  }

  const handleSaveName = async () =>
  {
    if (!user) return
    if (!firstName.trim())
    {
      setPanelError('First name is required.')
      return
    }
    setSaving(true)
    setPanelError(null)
    try
    {
      await user.update({ firstName: firstName.trim(), lastName: lastName.trim() })
      setActivePanel(null)
    }
    catch (e)
    {
      setPanelError(e instanceof Error ? e.message : 'Could not save name.')
    }
    finally
    {
      setSaving(false)
    }
  }

  const handleSavePassword = async () =>
  {
    if (!user) return
    if (!newPassword)
    {
      setPanelError('New password is required.')
      return
    }
    if (newPassword !== confirmPassword)
    {
      setPanelError('Passwords do not match.')
      return
    }
    if (user.passwordEnabled && !currentPassword)
    {
      setPanelError('Current password is required.')
      return
    }
    setSaving(true)
    setPanelError(null)
    try
    {
      await user.updatePassword({
        newPassword,
        currentPassword: user.passwordEnabled ? currentPassword : undefined,
        signOutOfOtherSessions: true,
      })
      setActivePanel(null)
    }
    catch (e)
    {
      setPanelError(e instanceof Error ? e.message : 'Could not update password.')
    }
    finally
    {
      setSaving(false)
    }
  }

  const handlePickPhoto = async () =>
  {
    if (!user) return
    if (!nativeImagePicker)
    {
      Alert.alert('Not Available', 'Photo upload is not available in this build.')
      return
    }
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ImagePicker = require('expo-image-picker') as typeof import('expo-image-picker')
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted)
    {
      Alert.alert('Permission Required', 'Allow access to your photo library to change your profile picture.')
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'] as unknown as import('expo-image-picker').MediaType[],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })
    if (result.canceled) return
    setUploadingPhoto(true)
    try
    {
      const uri = result.assets[0].uri
      const response = await fetch(uri)
      const blob = await response.blob()
      await user.setProfileImage({ file: blob })
    }
    catch (e)
    {
      Alert.alert('Upload Failed', 'Could not update your profile photo. Please try again.')
    }
    finally
    {
      setUploadingPhoto(false)
    }
  }

  const handleSignOut = () =>
  {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => signOut() },
    ])
  }

  const handleDeleteAccount = () =>
  {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all your data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () =>
          {
            try
            {
              await user?.delete()
            }
            catch (e)
            {
              Alert.alert('Error', 'Could not delete account. Please try again.')
            }
          },
        },
      ],
    )
  }

  const initials = [user?.firstName?.[0], user?.lastName?.[0]]
    .filter(Boolean)
    .join('')
    .toUpperCase()
    || user?.primaryEmailAddress?.emailAddress?.[0]?.toUpperCase()
    || '?'

  if (!isLoaded)
  {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-gray-900 items-center justify-center" edges={['top', 'bottom', 'left', 'right']}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900" edges={['top', 'bottom', 'left', 'right']}>
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900">
        <Pressable onPress={() => router.back()} hitSlop={12} className="mr-3">
          <AntDesign name="close" size={22} color={icon} />
        </Pressable>
        <Text className="text-xl font-semibold text-gray-900 dark:text-white">Account</Text>
      </View>

      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView keyboardShouldPersistTaps="handled">

          {/* Avatar */}
          <View className="items-center pt-8 pb-4">
            <Pressable onPress={handlePickPhoto} className="relative">
              {user?.imageUrl
                ? (
                    <Image source={{ uri: user.imageUrl }} className="w-24 h-24 rounded-full" />
                  )
                : (
                    <View className="w-24 h-24 rounded-full bg-blue-500 items-center justify-center">
                      <Text className="text-3xl font-bold text-white">{initials}</Text>
                    </View>
                  )}
              <View className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 items-center justify-center">
                {uploadingPhoto
                  ? <ActivityIndicator size="small" color="#208AEF" />
                  : <Feather name="camera" size={14} color={icon} />}
              </View>
            </Pressable>
            <Text className="mt-3 text-lg font-semibold text-gray-900 dark:text-white">
              {user?.fullName || user?.primaryEmailAddress?.emailAddress}
            </Text>
          </View>

          {/* Profile */}
          <SectionHeader title="Profile" />
          <View className="bg-white dark:bg-gray-800 mx-4 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
            <SettingsRow
              label="Name"
              value={user?.fullName || 'Not set'}
              onPress={() => openPanel('editName')}
            />
            {activePanel === 'editName' && (
              <View className="px-4 py-4 border-b border-gray-100 dark:border-gray-700 gap-3">
                <View className="gap-1">
                  <Text className="text-xs font-medium text-gray-500 dark:text-gray-400">First Name</Text>
                  <TextInput
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="First name"
                    placeholderTextColor={placeholder}
                    className="rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-3 py-2.5 text-sm text-gray-900 dark:text-white"
                  />
                </View>
                <View className="gap-1">
                  <Text className="text-xs font-medium text-gray-500 dark:text-gray-400">Last Name</Text>
                  <TextInput
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Last name"
                    placeholderTextColor={placeholder}
                    className="rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-3 py-2.5 text-sm text-gray-900 dark:text-white"
                  />
                </View>
                {panelError && activePanel === 'editName'
                  ? <Text className="text-xs text-red-500">{panelError}</Text>
                  : null}
                <View className="flex-row gap-2 pt-1">
                  <Pressable
                    onPress={() => setActivePanel(null)}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 items-center"
                  >
                    <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">Cancel</Text>
                  </Pressable>
                  <Pressable
                    onPress={handleSaveName}
                    disabled={saving}
                    className="flex-1 py-2.5 rounded-xl bg-blue-500 items-center"
                  >
                    {saving
                      ? <ActivityIndicator size="small" color="#fff" />
                      : <Text className="text-sm font-semibold text-white">Save</Text>}
                  </Pressable>
                </View>
              </View>
            )}
          </View>

          {/* Email Addresses */}
          <SectionHeader title="Email Addresses" />
          <View className="bg-white dark:bg-gray-800 mx-4 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
            {user?.emailAddresses.map((ea, i) => (
              <View
                key={ea.id}
                className={`flex-row items-center px-4 py-3.5 ${i < (user.emailAddresses.length - 1) ? 'border-b border-gray-100 dark:border-gray-700/60' : ''}`}
              >
                <Text className="flex-1 text-sm text-gray-900 dark:text-white" numberOfLines={1}>
                  {ea.emailAddress}
                </Text>
                {ea.id === user.primaryEmailAddressId
                  ? (
                      <View className="ml-2 px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40">
                        <Text className="text-xs font-medium text-blue-600 dark:text-blue-400">Primary</Text>
                      </View>
                    )
                  : null}
                {ea.verification?.status !== 'verified'
                  ? (
                      <View className="ml-2 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40">
                        <Text className="text-xs font-medium text-amber-600 dark:text-amber-400">Unverified</Text>
                      </View>
                    )
                  : null}
              </View>
            ))}
          </View>

          {/* Connected Accounts */}
          {(user?.externalAccounts?.length ?? 0) > 0 && (
            <>
              <SectionHeader title="Connected Accounts" />
              <View className="bg-white dark:bg-gray-800 mx-4 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
                {user!.externalAccounts.map((account, i) => (
                  <View
                    key={account.id}
                    className={`flex-row items-center px-4 py-3.5 ${i < (user!.externalAccounts.length - 1) ? 'border-b border-gray-100 dark:border-gray-700/60' : ''}`}
                  >
                    <View className="flex-1">
                      <Text className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                        {account.providerTitle()}
                      </Text>
                      <Text className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        {account.accountIdentifier()}
                      </Text>
                    </View>
                    <View className="w-2 h-2 rounded-full bg-green-400" />
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Security */}
          <SectionHeader title="Security" />
          <View className="bg-white dark:bg-gray-800 mx-4 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
            <SettingsRow
              label={user?.passwordEnabled ? 'Change Password' : 'Set Password'}
              onPress={() => openPanel('changePassword')}
            />
            {activePanel === 'changePassword' && (
              <View className="px-4 py-4 border-b border-gray-100 dark:border-gray-700 gap-3">
                {user?.passwordEnabled && (
                  <View className="gap-1">
                    <Text className="text-xs font-medium text-gray-500 dark:text-gray-400">Current Password</Text>
                    <TextInput
                      value={currentPassword}
                      onChangeText={setCurrentPassword}
                      placeholder="Current password"
                      placeholderTextColor={placeholder}
                      secureTextEntry
                      className="rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-3 py-2.5 text-sm text-gray-900 dark:text-white"
                    />
                  </View>
                )}
                <View className="gap-1">
                  <Text className="text-xs font-medium text-gray-500 dark:text-gray-400">New Password</Text>
                  <TextInput
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="New password"
                    placeholderTextColor={placeholder}
                    secureTextEntry
                    className="rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-3 py-2.5 text-sm text-gray-900 dark:text-white"
                  />
                </View>
                <View className="gap-1">
                  <Text className="text-xs font-medium text-gray-500 dark:text-gray-400">Confirm New Password</Text>
                  <TextInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirm new password"
                    placeholderTextColor={placeholder}
                    secureTextEntry
                    className="rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-3 py-2.5 text-sm text-gray-900 dark:text-white"
                  />
                </View>
                {panelError && activePanel === 'changePassword'
                  ? <Text className="text-xs text-red-500">{panelError}</Text>
                  : null}
                <View className="flex-row gap-2 pt-1">
                  <Pressable
                    onPress={() => setActivePanel(null)}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 items-center"
                  >
                    <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">Cancel</Text>
                  </Pressable>
                  <Pressable
                    onPress={handleSavePassword}
                    disabled={saving}
                    className="flex-1 py-2.5 rounded-xl bg-blue-500 items-center"
                  >
                    {saving
                      ? <ActivityIndicator size="small" color="#fff" />
                      : <Text className="text-sm font-semibold text-white">Save</Text>}
                  </Pressable>
                </View>
              </View>
            )}
          </View>

          {/* Actions */}
          <SectionHeader title="Session" />
          <View className="bg-white dark:bg-gray-800 mx-4 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
            <SettingsRow label="Sign Out" onPress={handleSignOut} />
          </View>

          <SectionHeader title="Danger Zone" />
          <View className="bg-white dark:bg-gray-800 mx-4 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 mb-8">
            <SettingsRow label="Delete Account" onPress={handleDeleteAccount} destructive />
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default ProfileScreen
