<script setup lang="ts">
import BaseDoc from '@/components/base/BaseDoc.vue'

const lore =
  'We talk about being in our 30s, and our 40s, and our 50s. We don’t talk about being in our 37s.'

const description = `Returns a human-friendly number based on the 1-2-5-10 progression, scaled to the appropriate power of ten. Useful to produce chart scales, tick itervals...`

const code = `function niceNumber(range: number, round = false): number {
  const exponent = Math.floor(Math.log10(range));
  const magnitude = Math.pow(10, exponent);
  const fraction = range / magnitude;
  const epsilon = Number.EPSILON * Math.max(1, Math.abs(fraction));

  let niceFraction: number;

  if (round) {
    if (fraction < 1.5 - epsilon) {
      niceFraction = 1;
    } else if (fraction < 3 - epsilon) {
      niceFraction = 2;
    } else if (fraction < 7 - epsilon) {
      niceFraction = 5;
    } else {
      niceFraction = 10;
    }
  } else {
    if (fraction <= 1 + epsilon) {
      niceFraction = 1;
    } else if (fraction <= 2 + epsilon) {
      niceFraction = 2;
    } else if (fraction <= 5 + epsilon) {
      niceFraction = 5;
    } else {
      niceFraction = 10;
    }
  }

  return niceFraction * magnitude;
}`

const imports = [
  'raindrops-on-roses',
  '@raindrops-on-roses/number',
  '@raindrops-on-roses/number-nice-number',
]

const example = `niceNumber(37) // 50
niceNumber(23, true) // 20
`
</script>

<template>
  <BaseDoc name="niceNumber" :lore :description :code :imports :example></BaseDoc>
</template>
