<script setup lang="ts">
import type { TurnstileRenderOptions } from '../types'

import { nextTick, useRuntimeConfig, useNuxtApp, ref, onMounted, onBeforeUnmount } from '#imports'

const props = defineProps({

  modelValue: {
    type: String,
    required: false,
  },
  element: {
    type: String,
    default: 'div',
  },

  siteKey: {
    type: String,
    required: false,
  },
  options: {
    type: Object as () => Omit<TurnstileRenderOptions, 'callback'>,
    default: () => ({}),
  },
  resetInterval: {
    type: Number,
    default: 1000 * 250,
  },
})

const emit = defineEmits<{
  (name: 'update:modelValue', token: string): void
}>()

const config = useRuntimeConfig().public.turnstile
const nuxtApp = useNuxtApp()

const el = ref()
const unmountStarted = ref(false)
let id: string | undefined = undefined
let interval: NodeJS.Timeout

const reset = () => {
  if (id) {
    nuxtApp.$turnstile.reset(id)
  }
}
const unmount = () => {
  unmountStarted.value = true
  clearInterval(interval)

  if (id) {
    nuxtApp.$turnstile.remove(id)
  }
}

onMounted(async () => {
  await nextTick() // TODO: remove once upstream vue bug is fixed (https://github.com/vuejs/core/issues/5844, https://github.com/nuxt/nuxt/issues/13471)

  id = await nuxtApp.$turnstile.render(el.value, {
    sitekey: props.siteKey || config.siteKey,
    ...props.options,
    callback: (token: string) => emit('update:modelValue', token),
  })
  interval = setInterval(reset, props.resetInterval)

  if (unmountStarted.value) {
    unmount()
  }
})

onBeforeUnmount(unmount)

// This means we will have CF script server-rendered in our HTML
if (import.meta.server) {
  nuxtApp.$turnstile.loadTurnstile()
}

defineExpose({ reset })
</script>

<template>
  <component
    :is="element"
    ref="el"
  />
</template>
