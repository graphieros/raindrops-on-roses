```vue
<script setup lang="ts">
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import { menuItems } from './menu'
import MenuItem from './MenuItem.vue'

defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const route = useRoute()

watch(
  () => route.fullPath,
  () => {
    emit('close')
  },
)
</script>

<template>
  <!-- Mobile backdrop -->
  <Transition name="fade">
    <button
      v-if="open"
      type="button"
      class="fixed inset-x-0 bottom-0 top-14 z-30 bg-black/40 md:hidden"
      aria-label="Close documentation menu"
      @click="emit('close')"
    />
  </Transition>

  <!-- Desktop sidebar / mobile drawer -->
  <aside
    class="fixed bottom-0 left-0 top-14 z-40 flex w-80 max-w-[85vw] -translate-x-full flex-col border-r border-app-border bg-app-background transition-transform duration-200 md:w-72 md:max-w-none md:translate-x-0"
    :class="{
      'translate-x-0': open,
    }"
  >
    <nav class="min-h-0 flex-1 overflow-y-auto px-3 py-4" aria-label="Documentation">
      <ul class="space-y-1">
        <MenuItem v-for="item in menuItems" :key="item.to ?? item.label" :item="item" />
      </ul>
    </nav>
  </aside>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 200ms ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```
