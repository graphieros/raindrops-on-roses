<script setup lang="ts">
defineProps<{
  content: string
}>()
</script>

<template>
  <div class="bg-tag px-2 text-xs py-0.5">
    {{ content }}
  </div>
</template>
