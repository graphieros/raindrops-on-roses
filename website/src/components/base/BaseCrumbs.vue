<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

type Crumb = {
  label: string
  to: string
}

const route = useRoute()

const crumbs = computed<Crumb[]>(() => {
  const parts = route.path.split('/').filter(Boolean)

  return parts.map((part, index) => {
    const to = `/${parts.slice(0, index + 1).join('/')}`

    return {
      label: part,
      to,
    }
  })
})

function toCamelCase(value: string) {
  return value.replace(/-([a-zA-Z0-9])/g, (_, char: string) => {
    return char.toUpperCase()
  })
}
</script>

<template>
  <nav
    v-if="route.path !== '/'"
    aria-label="Breadcrumb"
    class="sticky top-14 z-30 border-b border-app-border bg-app-background py-3 text-sm text-app-text-muted mb-5"
  >
    <ol class="flex flex-wrap items-center gap-2">
      <li>
        <RouterLink to="/" class="transition hover:text-app-text"> Home </RouterLink>
      </li>

      <template v-for="(crumb, index) in crumbs" :key="crumb.to">
        <li aria-hidden="true" class="text-app-text-muted">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#db6584"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M9 6l6 6l-6 6" />
          </svg>
        </li>

        <li>
          <RouterLink
            v-if="index < crumbs.length - 1"
            :to="crumb.to"
            class="transition hover:text-app-text"
          >
            {{ crumb.label }}
          </RouterLink>

          <span v-else class="font-medium text-app-text" aria-current="page">
            {{ toCamelCase(crumb.label) }}
          </span>
        </li>
      </template>
    </ol>
  </nav>
</template>
