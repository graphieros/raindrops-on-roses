<script setup lang="ts">
const { href, text, classes } = defineProps<{
  href: string
  text?: string
  classes?: string
}>()
</script>

<template>
  <a
    :href
    class="text-rose hover:text-app-text transition-colors underline"
    :class="classes"
    target="_blank"
  >
    {{ text }}
    <slot />
  </a>
</template>
