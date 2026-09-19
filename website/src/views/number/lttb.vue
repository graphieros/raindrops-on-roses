<script setup lang="ts">
import BaseDoc from '@/components/base/BaseDoc.vue'

const lore =
  'A point appears. A second point as a mirror sends a distance. Their love makes a triangle.'

const description = `Downsamples a numeric data series using the Largest-Triangle-Three-Buckets algorithm while preserving the first and last data points. Used to preserve the overall shape of a large dataset.`

const code = `function lttb({
  data,
  threshold,
}: {
  data: number[];
  threshold: number;
}): number[] {
  if (threshold >= data.length || threshold < 3) {
    return data;
  }
  const sampled = [];
  const bucketSize = (data.length - 2) / (threshold - 2);
  let a = 0;
  // First point as is
  sampled.push(data[a]);
  for (let i = 0; i < threshold - 2; i += 1) {
    const bucketStart = Math.floor((i + 1) * bucketSize) + 1;
    const bucketEnd = Math.min(
      Math.floor((i + 2) * bucketSize) + 1,
      data.length,
    );
    const bucket = data.slice(bucketStart, bucketEnd);
    const average = bucket.reduce((a, b) => a + b, 0) / bucket.length;
    let maxArea = -1;
    let nextA = a;

    for (let j = bucketStart; j < bucketEnd; j += 1) {
      const area = Math.abs((data[a] - average) * (j - a));
      if (area > maxArea) {
        maxArea = area;
        nextA = j;
      }
    }
    sampled.push(data[nextA]);
    a = nextA;
  }
  // Last point as is
  sampled.push(data[data.length - 1]);
  return sampled;
}`

const imports = [
  'raindrops-on-roses',
  '@raindrops-on-roses/number',
  '@raindrops-on-roses/number-lttb',
]

const example = `
const data = [5, 1, 2, 4, 6, 9]

lttb({
  data,
  threshold: 4,
}) // [5, 4, 9, 9]
`
</script>

<template>
  <BaseDoc name="lttb" :lore :description :code :imports :example></BaseDoc>
</template>
