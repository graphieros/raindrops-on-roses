<script setup lang="ts">
import { useThemeStore, type ThemePreference } from '@/stores/theme'

const themeStore = useThemeStore()

function changeTheme(event: Event) {
  const target = event.target as HTMLSelectElement

  themeStore.setPreference(target.value as ThemePreference)
}
</script>

<template>
  <select :value="themeStore.preference" aria-label="Color theme" @change="changeTheme">
    <option value="light">Light</option>
    <option value="dark">Dark</option>
    <option value="system">System</option>
  </select>
</template>
