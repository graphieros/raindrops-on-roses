<script setup lang="ts">
defineProps<{
  content: string
}>()
</script>

<template>
  <div class="bg-rose-dark px-2 text-xs text-white">
    {{ content }}
  </div>
</template>
