<script setup lang="ts">
import BaseTag from '@/components/base/BaseTag.vue'
import { menuItems } from '@/components/menu/menu'
import { ref, computed } from 'vue'

const menu = menuItems.filter((m) => m.label === 'number')[0]?.children

console.log(menu)
</script>

<template>
  <div>
    <h1 class="mb-6 text-2xl md:text-4xl">
      <code class="text-function">number</code>
      <span class="text-app-text-muted text-sm">(sub package)</span>
    </h1>

    <div class="flex flex-col gap-2">
      <ul class="flex flex-col gap-2">
        <RouterLink v-for="item in menu" :key="item.label" :to="item.to!">
          <div class="p-3 flex flex-col hover:bg-background-slight transition-colors">
            <code class="text-function">{{ item.label }}</code>
            <template v-if="item.keywords">
              <div class="flex flex-row flex-wrap gap-2">
                <BaseTag
                  v-for="tag in item.keywords"
                  :key="`${item.label}_${tag}`"
                  :content="tag"
                  class="w-fit"
                />
              </div>
            </template>
          </div>
        </RouterLink>
      </ul>
    </div>
  </div>
</template>
