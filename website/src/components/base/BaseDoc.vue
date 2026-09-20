<script setup lang="ts">
import { computed } from 'vue'
import BaseCode from './BaseCode.vue'
import { menuItems } from '../menu/menu'
import type { MenuItem } from '../menu/menu.types'
import BaseTag from './BaseTag.vue'

const props = defineProps<{
  name: string
  lore?: string
  description?: string
  code: string
  imports: string[]
  example: string
  params?: string
}>()

function findMenuItem(items: MenuItem[], name: string): MenuItem | undefined {
  for (const item of items) {
    if (item.label === name) {
      return item
    }

    if (item.children?.length) {
      const found = findMenuItem(item.children, name)

      if (found) {
        return found
      }
    }
  }
}

const keywords = computed<string[]>(() => {
  return findMenuItem(menuItems, props.name)?.keywords ?? []
})

const codeImports = computed(() =>
  props.imports.map((imp) => `import { ${props.name} } from "${imp}"`).join('\n'),
)

const npmInstalls = computed(() => props.imports.map((imp) => `npm i ${imp}`))
</script>

<template>
  <div>
    <div class="border-b border-app-border pb-6">
      <h1 class="mb-6 text-2xl text-function md:text-4xl">
        <code>{{ name }}</code>
      </h1>

      <p v-if="description" class="my-2 text-xl text-app-text-muted">
        {{ description }}
      </p>

      <div v-if="keywords.length" class="flex flex-wrap gap-2 mb-2">
        <BaseTag v-for="keyword in keywords" :key="keyword" :content="keyword" />
      </div>

      <p v-if="lore" class="max-w-180 text-app-text-muted">
        Lore:
        <i class="text-function">{{ lore }}</i>
      </p>
    </div>

    <div class="my-6 flex flex-col gap-6">
      Installation options (full package, full category, or just the one utility):

      <div class="flex flex-row flex-wrap gap-6">
        <BaseCode
          v-for="inst in npmInstalls"
          :key="inst"
          class="flex-1"
          :code="inst"
          language="bash"
        />
      </div>

      Import:
      <BaseCode :code="codeImports" />

      <div v-if="params">
        <BaseCode :code="params" />
      </div>

      Example:
      <BaseCode :code="example" />

      Implementation:
      <BaseCode :code />

      <span v-if="$slots.repl">Try it out:</span>
      <slot name="repl" />
    </div>
  </div>
</template>
