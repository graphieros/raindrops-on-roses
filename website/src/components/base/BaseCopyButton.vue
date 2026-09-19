<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref } from 'vue'

type Petal = {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  gravity: number
  drag: number
  rotation: number
  angularVelocity: number
  flutterPhase: number
  flutterSpeed: number
  flutterAmount: number
  scale: number
  age: number
  lifetime: number
}

const props = withDefaults(
  defineProps<{
    content: string
    resetDelay?: number
  }>(),
  {
    resetDelay: 1200,
  },
)

const copied = ref(false)
const buttonElement = ref<HTMLButtonElement | null>(null)
const petals = ref<Petal[]>([])
const petalElements = new Map<number, HTMLElement>()
const burstX = ref(0)
const burstY = ref(0)

let nextPetalId = 0
let animationFrame: number | null = null
let previousTime = 0
let resetTimer: ReturnType<typeof setTimeout> | null = null

function random(min: number, max: number) {
  return Math.random() * (max - min) + min
}

function setPetalElement(element: Element | null, id: number) {
  if (element instanceof HTMLElement) {
    petalElements.set(id, element)
  } else {
    petalElements.delete(id)
  }
}

function createPetal(): Petal {
  const angle = random(-Math.PI * 0.9, -Math.PI * 0.1)
  const horizontalImpulse = random(45, 145)
  const verticalImpulse = random(90, 170)

  return {
    id: nextPetalId++,
    x: random(-2, 2),
    y: random(-2, 2),
    vx: Math.cos(angle) * horizontalImpulse + random(-65, 65),
    vy: -verticalImpulse + Math.sin(angle) * random(10, 45),
    gravity: random(300, 480),
    drag: random(0.7, 1.6),
    rotation: random(0, 360),
    angularVelocity: random(-420, 420),
    flutterPhase: random(0, Math.PI * 2),
    flutterSpeed: random(6, 11),
    flutterAmount: random(3, 9),
    scale: random(0.65, 1.2),
    age: 0,
    lifetime: random(0.95, 1.45),
  }
}

function updatePetalElement(petal: Petal, time: number, progress: number) {
  const element = petalElements.get(petal.id)
  if (!element) {
    return
  }
  const flutterStrength = 1 - progress * 0.7
  const flutter =
    Math.sin(time * petal.flutterSpeed + petal.flutterPhase) * petal.flutterAmount * flutterStrength
  const flipStrength = Math.max(0.15, 1 - progress * 1.1)
  const flip = Math.sin(time * petal.flutterSpeed * 0.75 + petal.flutterPhase) * 55 * flipStrength
  const fadeStart = 0.65
  const opacity =
    progress < fadeStart ? Math.min(progress * 8, 1) : 1 - (progress - fadeStart) / (1 - fadeStart)

  element.style.opacity = String(Math.max(0, opacity))

  element.style.transform = `
    translate3d(
      ${petal.x + flutter}px,
      ${petal.y}px,
      0
    )
    rotate(${petal.rotation}deg)
    rotateY(${flip}deg)
    scale(${petal.scale})
  `
}

function animate(timestamp: number) {
  if (!previousTime) {
    previousTime = timestamp
  }

  const dt = Math.min((timestamp - previousTime) / 1000, 0.032)
  previousTime = timestamp
  const time = timestamp / 1000
  let hasLivingPetals = false

  for (const petal of petals.value) {
    if (petal.age >= petal.lifetime) {
      continue
    }
    hasLivingPetals = true
    petal.age += dt
    const progress = Math.min(petal.age / petal.lifetime, 1)
    const dragFactor = Math.exp(-petal.drag * dt)
    petal.vx *= dragFactor
    petal.vy *= dragFactor
    petal.vy += petal.gravity * dt
    petal.x += petal.vx * dt
    petal.y += petal.vy * dt
    const rotationDamping = progress < 0.3 ? 1.4 : 4.5
    petal.angularVelocity *= Math.exp(-rotationDamping * dt)
    petal.rotation += petal.angularVelocity * dt
    updatePetalElement(petal, time, progress)
  }

  if (hasLivingPetals) {
    animationFrame = requestAnimationFrame(animate)

    return
  }
  animationFrame = null
  previousTime = 0
  petals.value = []
  petalElements.clear()
}

async function createBurst() {
  const button = buttonElement.value

  if (!button) {
    return
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return
  }

  const rect = button.getBoundingClientRect()
  burstX.value = rect.left + rect.width / 2
  burstY.value = rect.top + rect.height / 2
  petals.value = Array.from({ length: 22 }, createPetal)

  await nextTick()

  if (animationFrame !== null) {
    cancelAnimationFrame(animationFrame)
  }

  previousTime = 0
  animationFrame = requestAnimationFrame(animate)
}

async function copy() {
  await navigator.clipboard.writeText(props.content)
  copied.value = true
  await createBurst()

  if (resetTimer) {
    clearTimeout(resetTimer)
  }

  resetTimer = setTimeout(() => {
    copied.value = false
  }, props.resetDelay)
}

onBeforeUnmount(() => {
  if (animationFrame !== null) {
    cancelAnimationFrame(animationFrame)
  }

  if (resetTimer) {
    clearTimeout(resetTimer)
  }
})
</script>

<template>
  <button
    ref="buttonElement"
    type="button"
    class="relative inline-flex size-9 cursor-pointer items-center justify-center border border-app-border bg-app-background text-app-text-muted transition hover:bg-app-surface-hover hover:text-app-text"
    :aria-label="copied ? 'Copied' : 'Copy to clipboard'"
    :title="copied ? 'Copied' : 'Copy'"
    @click="copy"
  >
    <svg v-if="!copied" class="size-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M8 8 8 21 21 21 21 8 8 8M3 15 3 3 15 3"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
      />
    </svg>

    <svg v-else class="size-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="m5 12 4 4L19 6"
        stroke="#a13653"
        stroke-width="3"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </button>

  <Teleport to="body">
    <div
      v-if="petals.length"
      class="pointer-events-none fixed left-0 top-0 z-9999 size-0"
      :style="{
        transform: `translate3d(${burstX}px, ${burstY}px, 0)`,
      }"
      aria-hidden="true"
    >
      <span
        v-for="petal in petals"
        :key="petal.id"
        :ref="(element) => setPetalElement(element as Element | null, petal.id)"
        class="petal"
      />
    </div>
  </Teleport>
</template>

<style scoped>
.petal {
  position: absolute;
  left: -3px;
  top: -5px;
  width: 7px;
  height: 11px;
  opacity: 0;
  border-radius: 75% 25% 70% 30%;
  background: #d96b88;
  transform-origin: center;
  backface-visibility: visible;
  will-change: transform, opacity;
}

.petal:nth-child(3n) {
  width: 5px;
  height: 9px;
  background: #eda0b4;
}

.petal:nth-child(4n) {
  width: 8px;
  height: 13px;
  background: #a13653;
}

.petal:nth-child(5n) {
  width: 6px;
  height: 10px;
  background: #f2afbf;
}
</style>
