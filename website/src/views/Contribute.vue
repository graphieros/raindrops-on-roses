<script setup lang="ts">
import BaseLink from '@/components/base/BaseLink.vue'
import BaseTooltip from '@/components/base/BaseTooltip.vue'
import { useMainStore } from '@/stores/main'
import { ref, computed } from 'vue'

const store = useMainStore()
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold tracking-tight text-app-text sm:text-3xl lg:text-5xl">
      Contributing
    </h1>
    <div class="my-6 text-app-text-muted">
      <p>
        <span class="text-app-text">Raindrops on Roses</span> is an open-source library, under the
        MIT license.
      </p>
      <p>
        Contributions are welcome: you can make a pull request in the
        <BaseLink href="https://github.com/graphieros/raindrops-on-roses">repository</BaseLink>, to
        share beautiful functions that inspire you.
      </p>
      <p>
        This library is a collection of favorite things, by humans who love programming, and wish to
        share beautiful pieces of code that can benefit everyone.
      </p>
      <p class="mt-6">
        Anyone can contribute. It does not have to be through code. You can come and say hi in our
        Discord server, propose some ideas, and socialize.
      </p>
      <p>
        <span class="text-app-text">Raindrops on Roses</span> is a human-first initiative. View
        Raindrops on roses on
        <BaseLink href="https://npmx.dev/package/raindrops-on-roses">npmx</BaseLink>.
      </p>
    </div>
  </div>

  <div class="flex flex-col">
    <BaseLink
      href="https://github.com/graphieros/raindrops-on-roses?tab=contributing-ov-file"
      classes="text-2xl"
      >Contribution guide</BaseLink
    >
    <BaseLink href="https://discord.gg/EkQfzAgstD" classes="text-2xl">Discord server</BaseLink>
  </div>

  <div class="mt-12">
    <h2>Contributors</h2>
    <div class="flex flex-row gap-2 flex-wrap mt-9">
      <BaseTooltip
        v-for="contributor in store.contributors"
        :key="contributor.id"
        :label="contributor.login"
        :classes="['text-white']"
      >
        <div class="flex flex-col">
          <a :href="contributor.html_url" target="_blank" class="w-12 h-12">
            <img :src="contributor.avatar_url" />
          </a>
          <div class="w-full bg-background-muted text-xs text-center">
            {{ contributor.contributions }}
          </div>
        </div>
      </BaseTooltip>
    </div>
  </div>
</template>
