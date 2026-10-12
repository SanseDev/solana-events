import { Redirect } from 'expo-router'

/** Route the app root into the first tab instead of the not-found screen. */
export default function Index() {
  return <Redirect href="/(tabs)/discover" />
}
