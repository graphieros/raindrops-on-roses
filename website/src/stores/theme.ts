import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export type ThemePreference = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'theme-preference'

export const useThemeStore = defineStore('theme', () => {
  const preference = ref<ThemePreference>('system')
  const systemDark = ref(false)

  let mediaQuery: MediaQueryList | null = null

  const resolvedTheme = computed<'light' | 'dark'>(() => {
    if (preference.value === 'system') {
      return systemDark.value ? 'dark' : 'light'
    }

    return preference.value
  })

  const isDark = computed(() => resolvedTheme.value === 'dark')

  function applyTheme() {
    const root = document.documentElement

    root.dataset.theme = resolvedTheme.value
    root.classList.toggle('dark', resolvedTheme.value === 'dark')
    root.style.colorScheme = resolvedTheme.value
  }

  function setPreference(value: ThemePreference) {
    preference.value = value

    localStorage.setItem(STORAGE_KEY, value)

    applyTheme()
  }

  function toggle() {
    setPreference(isDark.value ? 'light' : 'dark')
  }

  function handleSystemThemeChange(event: MediaQueryListEvent) {
    systemDark.value = event.matches

    if (preference.value === 'system') {
      applyTheme()
    }
  }

  function init() {
    mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    systemDark.value = mediaQuery.matches

    const storedPreference = localStorage.getItem(STORAGE_KEY)

    if (
      storedPreference === 'light' ||
      storedPreference === 'dark' ||
      storedPreference === 'system'
    ) {
      preference.value = storedPreference
    }

    applyTheme()

    mediaQuery.addEventListener('change', handleSystemThemeChange)
  }

  function destroy() {
    mediaQuery?.removeEventListener('change', handleSystemThemeChange)
    mediaQuery = null
  }

  return {
    preference,
    resolvedTheme,
    isDark,
    init,
    destroy,
    setPreference,
    toggle,
  }
})
