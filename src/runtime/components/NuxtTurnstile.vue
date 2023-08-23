<script setup lang="ts">
import type { TurnstileRenderOptions } from '../types'

import { useRuntimeConfig, useNuxtApp, ref, onMounted, onBeforeUnmount, nextTick } from '#imports'

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

let interval: NodeJS.Timeout

function reset() {
  return nuxtApp.$turnstile.reset(el.value)
}

defineExpose({ reset })
let id: string|undefined;
onMounted(async () => {
  await nextTick()
  id = await nuxtApp.$turnstile.render(el.value, {
    sitekey: props.siteKey || config.siteKey,
    ...props.options,
    callback: (token: string) => emit('update:modelValue', token),
  })
  interval = setInterval(reset, 1000 * 250)
})

// This means we will have CF script server-rendered in our HTML
if (process.server) {
  nuxtApp.$turnstile.loadTurnstile()
}

onBeforeUnmount(() => {
  clearInterval(interval)
  if (id) {
    nuxtApp.$turnstile.remove(id)  
  }
})
</script>

<template>
  <component :is="element" ref="el" />
</template>
