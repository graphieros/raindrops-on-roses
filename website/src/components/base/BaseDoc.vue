<script setup lang="ts">
import { ref, computed } from 'vue'
import BaseCode from './BaseCode.vue'

const props = defineProps<{
  name: string
  lore?: string
  description?: string
  code: string
  imports: string[]
  example: string
  params?: string
}>()

const codeImports = computed(() =>
  props.imports.map((imp) => `import { ${props.name} } from "${imp}"`).join('\n'),
)

const npmInstalls = computed(() => props.imports.map((imp) => `npm i ${imp}`))
</script>

<template>
  <div>
    <h1 class="text-2xl md:text-4xl text-function mb-6">
      <code>{{ name }}</code>
    </h1>
    <p class="text-xl text-app-text-muted my-2" v-if="description">{{ description }}</p>
    <p v-if="lore" class="max-w-180 text-app-text-muted">
      Lore:
      <i class="text-function">{{ lore }}</i>
    </p>
    <div class="flex flex-col gap-6 my-6">
      Installation:
      <div class="flex flex-row flex-wrap gap-6">
        <BaseCode class="flex-1" v-for="inst in npmInstalls" :code="inst" language="bash" />
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
    </div>
  </div>
</template>
