<script setup lang="ts">
import { useThemeStore, type ThemePreference } from '@/stores/theme'

const themeStore = useThemeStore()

const themes: Array<{
  value: ThemePreference
  label: string
}> = [
  {
    value: 'light',
    label: 'Light theme',
  },
  {
    value: 'dark',
    label: 'Dark theme',
  },
  {
    value: 'system',
    label: 'System theme',
  },
]

function changeTheme(theme: ThemePreference) {
  if (themeStore.preference === theme) {
    return
  }

  themeStore.setPreference(theme)
}
</script>

<template>
  <div
    class="inline-flex gap-1 border border-app-border bg-app-background p-1"
    role="group"
    aria-label="Color theme"
  >
    <button
      v-for="theme in themes"
      :key="theme.value"
      type="button"
      class="grid size-8 place-items-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-green"
      :class="
        themeStore.preference === theme.value
          ? 'cursor-default bg-background-muted text-rose'
          : 'cursor-pointer text-app-text-muted hover:bg-background-slight hover:text-app-text'
      "
      :aria-label="theme.label"
      :aria-pressed="themeStore.preference === theme.value"
      :title="theme.label"
      @click="changeTheme(theme.value)"
    >
      <svg
        v-if="theme.value === 'light'"
        class="size-4.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="m4.93 4.93 1.42 1.42" />
        <path d="m17.66 17.66 1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="m6.34 17.66-1.41 1.41" />
        <path d="m19.07 4.93-1.41 1.41" />
      </svg>

      <svg
        v-else-if="theme.value === 'dark'"
        class="size-4.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
      </svg>

      <svg
        v-else
        class="size-4.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="4" width="18" height="12" rx="2" />
        <path d="M8 20h8" />
        <path d="M12 16v4" />
      </svg>
    </button>
  </div>
</template>
