import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import 'react-native-reanimated'
import { AppProviders } from '@/components/app-providers'
import { useCallback } from 'react'
import * as SplashScreen from 'expo-splash-screen'
import { View } from 'react-native'
import { usePreferences } from '@/src/hooks/usePreferences'

SplashScreen.preventAutoHideAsync()

/**
 * Root navigation. Preference hydration completes before onboarding versus
 * tabs is chosen, so returning users never flash Discover and fresh users
 * never land in tabs first.
 */
function RootNavigator() {
  const { hydrated, onboardingCompleted } = usePreferences()

  if (!hydrated) {
    return null
  }

  if (!onboardingCompleted) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" />
      </Stack>
    )
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="event/[id]" />
      <Stack.Screen name="preferences" />
      <Stack.Screen name="+not-found" />
    </Stack>
  )
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  })

  const onLayoutRootView = useCallback(async () => {
    if (loaded) {
      // Hiding the splash screen only after the root view has performed layout avoids a blank frame.
      await SplashScreen.hideAsync()
    }
  }, [loaded])

  if (!loaded) {
    return null
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <AppProviders>
        <RootNavigator />
        <StatusBar style="light" />
      </AppProviders>
    </View>
  )
}
