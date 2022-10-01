<script setup lang="ts">
import { useRuntimeConfig, useNuxtApp, ref, onMounted, nextTick } from '#imports'
import type { TurnstileRenderOptions } from '../types'

const props = defineProps({
  modelValue: {
    type: String,
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
})

const emit = defineEmits<{
  (name: 'update:modelValue', token: string)
}>()

const config = useRuntimeConfig().public.turnstile
const nuxtApp = useNuxtApp()

const el = ref()

let interval

onMounted(async () => {
  await nextTick()
  nuxtApp.$turnstile.render(el.value, {
    sitekey: props.siteKey || config.siteKey,
    ...props.options,
    callback: token => emit('update:modelValue', token),
  })
  interval = setInterval(() => nuxtApp.$turnstile.reset(el.value), 1000 * 250)
})

// This means we will have CF script server-rendered in our HTML
if (process.server) {
  nuxtApp.$turnstile.loadTurnstile()
}

onBeforeUnmount(() => clearInterval(interval))
</script>

<template>
  <component :is="element" ref="el" />
</template>
