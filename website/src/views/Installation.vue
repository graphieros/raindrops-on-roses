<script setup lang="ts">
import BaseCode from '@/components/base/BaseCode.vue'
import { ref, computed } from 'vue'

const exampleFull = `import { niceNumber } from "raindrops-on-roses"`
const exampleCategory = `import { niceNumber } from "@raindrops-on-roses/number"`
const exampleUnit = `import { niceNumber } from "@raindrops-on-roses/number-nice-number"`
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold tracking-tight text-app-text sm:text-3xl lg:text-5xl">
      Installation
    </h1>
    <div class="my-6 text-app-text-muted">
      <p>
        <span class="text-app-text">Raindrops on Roses</span> is an open-source library, under the
        MIT license.
      </p>
      <p class="max-w-180">
        If you only need to pick a function here and there, and wish to maintain the code yourself,
        you can choose to copy the function implementations in the docs, and paste them in your
        codebase.
      </p>
    </div>

    <div>
      <h2 class="text-2xl mb-6">Import utilies granularly:</h2>

      <h3 class="mb-2">Import the full package...</h3>
      <BaseCode code="npm i raindrops-on-roses" language="bash" />
      <BaseCode :code="exampleFull" class="mt-2" />

      <h3 class="mt-6 mb-2">...or import a specific category...</h3>
      <BaseCode code="npm i @raindrops-on-roses/number" language="bash" />
      <BaseCode :code="exampleCategory" class="mt-2" />

      <h3 class="mt-6 mb-2">...or import a specific utility.</h3>
      <BaseCode code="npm i @raindrops-on-roses/number-nice-number" language="bash" />
      <BaseCode :code="exampleUnit" class="mt-2" />
    </div>
  </div>
</template>
