<script setup lang="ts">
import BaseCode from '@/components/base/BaseCode.vue'
import logo from '../assets/images/raindrops_on_roses.png'
import { useMainStore } from '@/stores/main'

const store = useMainStore()
</script>

<template>
  <main>
    <section class="grid min-h-[70vh] items-center gap-10 py-12 md:grid-cols-2 md:gap-16 md:py-20">
      <div class="order-2 text-center md:order-1 md:text-left">
        <p class="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-rose">Docs</p>

        <h1 class="text-4xl font-bold tracking-tight text-app-text sm:text-5xl lg:text-6xl">
          Raindrops on Roses
        </h1>

        <p class="mx-auto mt-6 max-w-xl text-base leading-7 text-app-text-muted md:mx-0 md:text-lg">
          A collection of delicately crafted TS functions from passionate OSS maintainers, 100%
          tested and made with love.
        </p>

        <BaseCode class="w-fit mt-8" :code="`npm i raindrops-on-roses`" language="bash" />

        <div
          class="mt-3 flex flex-col items-center justify-center gap-3 sm:flex-row md:justify-start"
        >
          <button
            class="inline-flex items-center justify-center border border-app-border px-5 py-3 text-sm font-semibold text-app-text transition bg-rose-dark hover:bg-rose cursor-pointer"
          >
            <RouterLink to="/installation" class="text-white"> Get started </RouterLink>
          </button>

          <button
            class="inline-flex items-center justify-center border border-app-border px-5 py-3 text-sm font-semibold text-app-text transition hover:bg-app-background-slight cursor-pointer"
          >
            <a
              href="https://github.com/graphieros/raindrops-on-roses"
              target="_blank"
              class="flex flex-row gap-2 items-center tabular-nums"
            >
              GitHub repository
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#be3d5f">
                <path
                  d="M8.243 7.34l-6.38 .925l-.113 .023a1 1 0 0 0 -.44 1.684l4.622 4.499l-1.09 6.355l-.013 .11a1 1 0 0 0 1.464 .944l5.706 -3l5.693 3l.1 .046a1 1 0 0 0 1.352 -1.1l-1.091 -6.355l4.624 -4.5l.078 -.085a1 1 0 0 0 -.633 -1.62l-6.38 -.926l-2.852 -5.78a1 1 0 0 0 -1.794 0l-2.853 5.78z"
                />
              </svg>
              {{ store.stars }}
            </a>
          </button>
        </div>
      </div>

      <div class="order-1 flex justify-center md:order-2 md:justify-end">
        <div class="relative w-full max-w-md lg:max-w-lg">
          <div class="absolute inset-0 -z-10 scale-90 rounded-full bg-app-primary/10 blur-3xl" />

          <img
            :src="logo"
            alt="Raindrops on Roses"
            class="mx-auto w-full object-contain rounded-full"
          />
        </div>
      </div>
    </section>
  </main>
</template>
