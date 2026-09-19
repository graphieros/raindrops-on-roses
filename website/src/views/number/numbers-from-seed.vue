<script setup lang="ts">
import BaseDoc from '@/components/base/BaseDoc.vue'

const lore =
  'Lore: All the flowers of all the tomorrows are in the seeds of today. (Native american proverb)'

const description = `Generates a deterministic array of pseudo-random numbers from a seed`

const code = `function numbersFromSeed({
  count,
  seed,
  trend = null,
  multiplicator = 1,
  rounded = true,
}: {
  count: number;
  seed?: string | number;
  trend?: "up" | "down" | null;
  multiplicator?: number;
  rounded?: boolean;
}): number[] {
  const seedString = String(seed);
  let hash = 2166136261;
  for (let i = 0; i < seedString.length; i += 1) {
    hash ^= seedString.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  let state = hash >>> 0;
  const random = () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    const res = (((t ^ (t >>> 14)) >>> 0) / 4294967296) * multiplicator;
    return rounded ? Math.round(res) : res;
  };
  const numbers = Array.from({ length: count }, random);
  if (trend === "up") {
    return numbers.sort((a, b) => a - b);
  }
  if (trend === "down") {
    return numbers.sort((a, b) => b - a);
  }
  return numbers;
}`

const imports = [
  'raindrops-on-roses',
  '@raindrops-on-roses/numbers-from-seed',
  '@raindrops-on-roses/number-numbers-from-seed',
]

const example = `numbersFromSeed({
  count: 5,
  seed: "abc",
}) // [1, 1, 0, 1, 1]

numbersFromSeed({
  count: 5,
  seed: 123,
  trend: "up",
  multiplicator: 100,
}) // [7, 8, 16, 39, 66]

numbersFromSeed({
  count: 5,
  seed: 123,
  trend: "down",
  multiplicator: 100,
}) // [66, 39, 16, 8, 7]
`
</script>

<template>
  <BaseDoc name="numbersFromSeed" :lore :description :code :imports :example></BaseDoc>
</template>
