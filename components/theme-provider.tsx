'use client'

import * as React from 'react'

type Theme = 'light' | 'dark' | 'system'
type ResolvedTheme = 'light' | 'dark'

export type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
  attribute?: 'class' | `data-${string}`
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}

type ThemeContextValue = {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
}

const ThemeContext = React.createContext<ThemeContextValue | undefined>(
  undefined,
)

const MEDIA_QUERY = '(prefers-color-scheme: dark)'

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia(MEDIA_QUERY).matches ? 'dark' : 'light'
}

function disableTransitionsTemporarily() {
  const style = document.createElement('style')
  style.appendChild(
    document.createTextNode(
      '*,*::before,*::after{transition:none!important;-webkit-transition:none!important}',
    ),
  )
  document.head.appendChild(style)
  window.getComputedStyle(document.body)
  setTimeout(() => {
    if (style.parentNode) {
      style.parentNode.removeChild(style)
    }
  }, 1)
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'theme',
  attribute = 'class',
  enableSystem = true,
  disableTransitionOnChange = false,
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(defaultTheme)
  const [resolvedTheme, setResolvedTheme] = React.useState<ResolvedTheme>('light')

  const applyTheme = React.useCallback(
    (nextTheme: Theme) => {
      const root = document.documentElement
      const resolved =
        nextTheme === 'system' && enableSystem ? getSystemTheme() : (nextTheme === 'dark' ? 'dark' : 'light')

      if (disableTransitionOnChange) {
        disableTransitionsTemporarily()
      }

      if (attribute === 'class') {
        root.classList.remove('light', 'dark')
        root.classList.add(resolved)
      } else {
        root.setAttribute(attribute, resolved)
      }

      root.style.colorScheme = resolved
      setResolvedTheme(resolved)
    },
    [attribute, disableTransitionOnChange, enableSystem],
  )

  React.useEffect(() => {
    let initialTheme = defaultTheme
    try {
      const savedTheme = localStorage.getItem(storageKey) as Theme | null
      if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system') {
        initialTheme = savedTheme
      }
    } catch {
      // Ignore storage access errors in restricted environments.
    }

    setThemeState(initialTheme)
    applyTheme(initialTheme)
  }, [applyTheme, defaultTheme, storageKey])

  React.useEffect(() => {
    const media = window.matchMedia(MEDIA_QUERY)
    const onChange = () => {
      if (theme === 'system') {
        applyTheme('system')
      }
    }

    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [applyTheme, theme])

  const setTheme = React.useCallback(
    (nextTheme: Theme) => {
      setThemeState(nextTheme)
      try {
        localStorage.setItem(storageKey, nextTheme)
      } catch {
        // Ignore storage write errors in restricted environments.
      }
      applyTheme(nextTheme)
    },
    [applyTheme, storageKey],
  )

  const value = React.useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
    }),
    [theme, resolvedTheme, setTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = React.useContext(ThemeContext)
  if (!context) {
    return {
      theme: 'system' as Theme,
      resolvedTheme: 'light' as ResolvedTheme,
      setTheme: () => {},
    }
  }
  return context
}
