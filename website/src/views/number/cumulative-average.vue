<script setup lang="ts">
import BaseDoc from '@/components/base/BaseDoc.vue'

const lore = 'Every new experience changes ever so slightly the average that came before.'

const description = 'Calculates the cumulative average of the provided values.'

const code = `function cumulativeAverage<T = unknown>({
  values,
  config = {},
}: CumulativeAverageParams<T>): Array<number | T> {
  const { keepInvalid = true, convertInvalidToZero = false } = config;

  const result: Array<number | T> = [];
  let sum = 0;
  let count = 0;

  for (const value of values) {
    const valid = Number.isFinite(value);

    if (!valid && !keepInvalid) continue;

    if (!valid && !convertInvalidToZero) {
      result.push(value);
      continue;
    }

    sum += valid ? (value as number) : 0;
    result.push(sum / ++count);
  }

  return result;
}`

const imports = [
  'raindrops-on-roses',
  '@raindrops-on-roses/number',
  '@raindrops-on-roses/number-cumulative-average',
]

const example = `cumulativeAverage({
  values: [1, 2, 3],
}) // [1, 1.5, 2]

cumulativeAverage({
    values: [1, null, 3],
    config: { keepInvalid: true },
}) // [1, null, 2]

cumulativeAverage({
    values: [1, null, 3],
    config: { keepInvalid: true, convertInvalidToZero: true },
}) // [1, 0.5, 1.3333333333333333]
`
</script>

<template>
  <BaseDoc name="cumulativeAverage" :lore :description :code :imports :example></BaseDoc>
</template>
