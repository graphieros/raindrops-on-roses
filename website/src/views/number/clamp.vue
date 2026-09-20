<script setup lang="ts">
import BaseDoc from '@/components/base/BaseDoc.vue'
import BaseRepl from '@/components/base/BaseRepl.vue'
import { ref } from 'vue'

const lore =
  'Procrustes is an innkeeper who forces his guests to sleep in a magical bed whose size fits no one. Either it is too short, in which case Procrustes cuts off whatever parts of the traveler stick out; or it is too long, in which case the innkeeper stretches the limbs of those who lie in it until they match the size of the bed.'

const description = 'Clamps a numeric value between a minimum and maximum bound.'

const code = `function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}`

const imports = [
  'raindrops-on-roses',
  '@raindrops-on-roses/number',
  '@raindrops-on-roses/number-clamp',
]

const example = `clamp(-5, 0, 10) // 0
clamp(15, 0, 10) // 10
clamp(0, 0, 10) // 0
clamp(10, 0, 10) // 10
`

const repl = ref(`import { clamp } from '@raindrops-on-roses/number-clamp'

const result = clamp(150, 0, 100)

console.log(result)
`)
</script>

<template>
  <BaseDoc name="clamp" :lore :description :code :imports :example>
    <template #repl>
      <BaseRepl
        v-model="repl"
        :packages="{
          '@raindrops-on-roses/number-clamp': '0.0.2',
        }"
      />
    </template>
  </BaseDoc>
</template>
