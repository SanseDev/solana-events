import { type PropsWithChildren } from 'react'
import { ThemeProvider } from '@react-navigation/native'
import { navTheme } from '@/src/theme'

/** Dark-only MVP: the navigation theme is pinned to the app palette. */
export function AppTheme({ children }: PropsWithChildren) {
  return <ThemeProvider value={navTheme}>{children}</ThemeProvider>
}
