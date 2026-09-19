<script setup lang="ts">
import petals from '../../assets/images/petals_in_the_wind.png'

defineProps<{
  menuOpen?: boolean
}>()

const emit = defineEmits<{
  toggleMenu: []
}>()
</script>

<template>
  <header class="fixed inset-x-0 top-0 z-50 h-14 border-b border-app-border bg-app-background">
    <div class="flex h-full items-center px-4">
      <div class="flex min-w-0 flex-1 items-center">
        <slot />
      </div>

      <img :src="petals" class="hidden md:block sm:w-36 fixed top-0 -right-2" />

      <button
        type="button"
        class="ml-auto inline-flex size-9 shrink-0 items-center justify-center rounded-md text-app-text transition hover:bg-app-surface-hover md:hidden"
        :aria-label="menuOpen ? 'Close documentation menu' : 'Open documentation menu'"
        :aria-expanded="menuOpen"
        @click="emit('toggleMenu')"
      >
        <svg v-if="!menuOpen" class="size-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M4 6h16M4 12h16M4 18h16"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>

        <svg v-else class="size-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M6 6l12 12M18 6 6 18"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
      </button>
    </div>
  </header>
</template>
