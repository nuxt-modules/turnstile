<template>
  <div>
    <NuxtLink
      id="home-link"
      to="/home"
    >
      to /home
    </NuxtLink>
    <button @click="toggle = !toggle">
      Load Turnstile
    </button>
    <NuxtTurnstile
      v-if="toggle"
      v-model="token"
    />
    <button @click="submit('/api/submit')">
      Verify with `verifyTurnstileToken`
    </button>
    <button @click="submit('/_turnstile/validate')">
      Verify with `/_turnstile/validate`
    </button>
    <pre>{{ response }}</pre>
  </div>
</template>

<script setup lang="ts">
const toggle = ref(false)
const token = ref()
const response = ref()

async function submit(endpoint: '/api/submit' | '/_turnstile/validate') {
  response.value = await $fetch(endpoint, {
    method: 'POST',
    body: { token: token.value },
  })
}
</script>
