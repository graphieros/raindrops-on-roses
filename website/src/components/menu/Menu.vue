<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { menuItems } from './menu'
import MenuItem from './MenuItem.vue'
import type { MenuItem as MenuItemType } from './menu.types'

defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const route = useRoute()
const search = ref('')
const normalizedSearch = computed(() => search.value.trim().toLocaleLowerCase())
const isSearching = computed(() => normalizedSearch.value.length > 0)

function filterMenuItems(items: MenuItemType[], query: string): MenuItemType[] {
  return items.reduce<MenuItemType[]>((result, item) => {
    const label = item.label.toLocaleLowerCase()
    const description = item.description?.toLocaleLowerCase() ?? ''
    const keywords = item.keywords?.map((keyword) => keyword.toLocaleLowerCase()) ?? []

    const matches =
      label.includes(query) ||
      description.includes(query) ||
      keywords.some((keyword) => keyword.includes(query))

    if (matches) {
      result.push(item)
      return result
    }

    if (item.children?.length) {
      const children = filterMenuItems(item.children, query)

      if (children.length) {
        result.push({
          ...item,
          children,
        })
      }
    }

    return result
  }, [])
}

const filteredMenuItems = computed(() => {
  if (!normalizedSearch.value) {
    return menuItems
  }

  return filterMenuItems(menuItems, normalizedSearch.value)
})

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
    <nav class="flex min-h-0 flex-1 flex-col" aria-label="Documentation">
      <!-- Search -->
      <div class="shrink-0 border-b border-app-border p-3">
        <div class="relative">
          <svg
            class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-app-text-muted"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.8" />

            <path d="m16 16 4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
          </svg>

          <input
            v-model="search"
            type="search"
            placeholder="Search documentation..."
            aria-label="Search documentation"
            class="w-full rounded-none border border-app-border bg-app-background py-2 pl-9 pr-3 text-sm text-app-text outline-none transition placeholder:text-app-text-muted focus:border-app-primary"
          />
        </div>
      </div>

      <!-- Menu -->
      <div class="min-h-0 flex-1 overflow-y-auto px-3 py-4">
        <ul v-if="filteredMenuItems.length" class="space-y-1">
          <MenuItem
            v-for="item in filteredMenuItems"
            :key="item.to ?? item.label"
            :item="item"
            :force-open="isSearching"
          />
        </ul>

        <p v-else class="px-3 py-6 text-center text-sm text-app-text-muted">No results found.</p>
      </div>
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
