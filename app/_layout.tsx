import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import 'react-native-reanimated'
import { AppProviders } from '@/components/app-providers'
import { useCallback } from 'react'
import * as SplashScreen from 'expo-splash-screen'
import { View } from 'react-native'

SplashScreen.preventAutoHideAsync()

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
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="event/[id]" />
          <Stack.Screen name="interests" />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="light" />
      </AppProviders>
    </View>
  )
}
