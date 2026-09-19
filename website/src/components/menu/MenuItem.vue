<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import type { MenuItem } from './menu.types'

const props = defineProps<{
  item: MenuItem
  depth?: number
}>()

const route = useRoute()

const depth = computed(() => props.depth ?? 0)

const hasChildren = computed(() => {
  return Boolean(props.item.children?.length)
})

const selected = computed(() => {
  function contains(item: MenuItem): boolean {
    if (item.to === route.path) {
      return true
    }

    return item.children?.some(contains) ?? false
  }

  return contains(props.item)
})
</script>

<template>
  <li>
    <details v-if="hasChildren" :open="selected || depth === 0" class="group">
      <summary
        class="flex cursor-pointer list-none items-center justify-between gap-2 rounded-md px-3 py-2 text-sm font-medium text-app-text transition hover:bg-app-surface-hover [&::-webkit-details-marker]:hidden"
      >
        <span>
          {{ item.label }}
        </span>

        <svg
          class="size-4 shrink-0 transition-transform group-open:rotate-90"
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M7.5 5 12.5 10 7.5 15"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </summary>

      <ul class="mt-1 space-y-1 pl-3">
        <MenuItem
          v-for="child in item.children"
          :key="child.to ?? child.label"
          :item="child"
          :depth="depth + 1"
        />
      </ul>
    </details>

    <RouterLink v-else-if="item.to" :to="item.to" custom v-slot="{ href, navigate, isActive }">
      <a
        :href="href"
        class="block px-3 py-2 text-sm transition"
        :class="[
          isActive
            ? 'bg-background-slight text-app-text font-medium border-r border-app-green'
            : 'text-app-text-muted hover:bg-app-surface-hover hover:text-app-text',
          item.color ?? '',
        ]"
        @click="navigate"
      >
        {{ item.label }}
      </a>
    </RouterLink>
  </li>
</template>
