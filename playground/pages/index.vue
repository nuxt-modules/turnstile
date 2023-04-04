<template>
  <div>
    <button @click="toggle = !toggle">Load Turnstiles</button>
    <form @submit.prevent="onSubmit">
      <h2>Using vue model</h2>
      <NuxtTurnstile v-if="toggle" v-model="token" :options="{ action: 'vue' }" />
      <input type="submit" />
    </form>
    <pre>{{ response1 }}</pre>
    <hr />
    <form @submit.prevent="onNativeSubmit">
      <h2>Using native form</h2>
      <NuxtTurnstile v-if="toggle" ref="turnstile" :options="{ action: 'native' }" />
      <input type="submit" />
    </form>
    <button @click="turnstile.reset()">Reset</button>
    <pre>{{ response2 }}</pre>
  </div>
</template>

<script setup lang="ts">
const toggle = ref(false)
const token = ref()

const turnstile = ref()

const response1 = ref('')
async function onSubmit() {
  response1.value = await $fetch('/api/submit', {
    method: 'POST',
    body: {
      token: token.value,
    },
  })
}

const response2 = ref('')
async function onNativeSubmit(e: Event) {
  response2.value = await $fetch('/api/submit', {
    method: 'POST',
    // This will automatically send token as `cf-turnstile-response`
    body: Object.fromEntries(new FormData(e.target as HTMLFormElement).entries()),
  })
}
</script>
