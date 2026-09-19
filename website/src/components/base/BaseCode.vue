<script setup lang="ts">
import { computed } from 'vue'
import Prism from 'prismjs'

import BaseCopyButton from './BaseCopyButton.vue'

import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-bash'

const props = withDefaults(
  defineProps<{
    code: string
    language?: string
  }>(),
  {
    language: 'typescript',
  },
)

function dedent(value: string) {
  const normalized = value
    .replace(/\r\n/g, '\n')
    .replace(/^\n/, '')
    .replace(/\n\s*$/, '')

  const lines = normalized.split('\n')

  const indentation = lines
    .filter((line) => line.trim().length > 0)
    .map((line) => {
      return line.match(/^(\s*)/)?.[1]?.length ?? 0
    })

  if (indentation.length === 0) {
    return normalized
  }

  const minIndent = Math.min(...indentation)

  return lines
    .map((line) => {
      if (line.trim().length === 0) {
        return ''
      }

      return line.slice(minIndent)
    })
    .join('\n')
}

const normalizedCode = computed(() => {
  return dedent(props.code)
})

const highlightedCode = computed(() => {
  const grammar = Prism.languages[props.language]

  if (!grammar) {
    console.warn(`Prism language "${props.language}" is not loaded`)
    return Prism.util.encode(normalizedCode.value)
  }

  return Prism.highlight(normalizedCode.value, grammar, props.language)
})
</script>

<template>
  <div class="relative">
    <div class="absolute right-3 top-3 z-10">
      <BaseCopyButton :content="normalizedCode" />
    </div>

    <pre
      class="overflow-x-auto border border-app-border bg-background-slight p-4 pr-14 text-sm leading-6"
    ><code
      :class="`language-${language}`"
      v-html="highlightedCode"
    /></pre>
  </div>
</template>
