```vue
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import logo from './assets/images/small_raindrops_on_roses.png'

import { useThemeStore } from './stores/theme'
import BaseContainer from './components/base/BaseContainer.vue'
import BaseHeader from './components/base/BaseHeader.vue'
import Menu from './components/menu/Menu.vue'
import BaseCode from './components/base/BaseCode.vue'
import { useMainStore } from './stores/main.ts'

const themeStore = useThemeStore()
const mainStore = useMainStore()
const menuOpen = ref(false)

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

function closeMenu() {
  menuOpen.value = false
}

onMounted(() => {
  themeStore.init()
  mainStore.fetchStars()
  mainStore.fetchContributors()
})

onBeforeUnmount(() => {
  themeStore.destroy()
})
</script>

<template>
  <div class="min-h-screen bg-app-background text-app-text">
    <BaseHeader :menu-open="menuOpen" @toggle-menu="toggleMenu">
      <RouterLink to="/" class="font-semibold text-app-text flex flex-row gap-2 items-center">
        <img :src="logo" alt="logo" class="w-14 rounded-full" />
        Raindrops on Roses
      </RouterLink>
    </BaseHeader>

    <Menu :open="menuOpen" @close="closeMenu" />

    <main class="min-w-0 pt-14 md:ml-72">
      <BaseContainer>
        <RouterView />
      </BaseContainer>
    </main>
  </div>
</template>
