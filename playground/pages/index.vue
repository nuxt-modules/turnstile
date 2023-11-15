<template>
  <div>
    <NuxtLink id="home-link" to="/home">to /home</NuxtLink>
    <div>
      <label for="language">Select Turnstile Language : </label>
      <select id="language" v-model="selectedLanguage">
        <option v-for="lang in languages" :key="lang" :value="lang">{{ lang }}</option>
      </select>
    </div>
    <button @click="toggle = !toggle">Load Turnstiles</button>
    <form @submit.prevent="onSubmit">
      <h2>Using vue model</h2>
      <NuxtTurnstile v-if="toggle" :key="selectedLanguage" v-model="token"
        :options="{ action: 'vue', language: selectedLanguage }" />
      <input type="submit" />
    </form>
    <pre>{{ response1 }}</pre>
    <hr />
    <form @submit.prevent="onNativeSubmit">
      <h2>Using native form</h2>
      <NuxtTurnstile v-if="toggle" :key="selectedLanguage" ref="turnstile"
        :options="{ action: 'native', language: selectedLanguage }" />
      <input type="submit" />
    </form>
    <button :disabled="!turnstile" @click="turnstile.reset()">Reset</button>
    <pre>{{ response2 }}</pre>
  </div>
</template>

<script setup lang="ts">
const selectedLanguage = ref('en')
const languages = ['en', 'de', 'fr']

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
