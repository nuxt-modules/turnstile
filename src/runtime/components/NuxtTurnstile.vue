<script setup lang="ts">
import type { TurnstileRenderOptions } from '../types'

import { useRuntimeConfig, useNuxtApp, ref, onMounted, onBeforeUnmount } from '#imports'

const props = defineProps({
  // eslint-disable-next-line vue/require-default-prop
  modelValue: {
    type: String,
    required: false,
  },
  element: {
    type: String,
    default: 'div',
  },
  // eslint-disable-next-line vue/require-default-prop
  siteKey: {
    type: String,
    required: false,
  },
  options: {
    type: Object as () => Omit<TurnstileRenderOptions, 'callback'>,
    default: () => ({}),
  },
})

const emit = defineEmits<{
  (name: 'update:modelValue', token: string): void
}>()

const config = useRuntimeConfig().public.turnstile
const nuxtApp = useNuxtApp()

const el = ref()
const unmountStarted = ref(false)

let interval: NodeJS.Timeout

const reset = () => nuxtApp.$turnstile.reset(el.value)
const unmount = () => {
  unmountStarted.value = true
  clearInterval(interval)
  nuxtApp.$turnstile.remove(el.value)
}

onMounted(async () => {
  await nuxtApp.$turnstile.render(el.value, {
    sitekey: props.siteKey || config.siteKey,
    ...props.options,
    callback: (token: string) => emit('update:modelValue', token),
  })
  interval = setInterval(reset, 1000 * 250)

  if (unmountStarted.value) {
    unmount()
  }
})

onBeforeUnmount(unmount)

// This means we will have CF script server-rendered in our HTML
if (process.server) {
  nuxtApp.$turnstile.loadTurnstile()
}

defineExpose({ reset })
</script>

<template>
  <component :is="element" ref="el" />
</template>
