# Nuxt Turnstile

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![Github Actions][github-actions-src]][github-actions-href]
[![Codecov][codecov-src]][codecov-href]

> [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/) integration for [Nuxt 3](https://v3.nuxtjs.org)

- [✨ &nbsp;Changelog](https://github.com/nuxt-modules/turnstile/blob/main/CHANGELOG.md)
<!-- - [▶️ &nbsp;Online playground](https://stackblitz.com/github/nuxt-modules/turnstile/tree/main/playground) -->

## Features

- 💪 smart verification with minimal user interaction
- 🕵️‍♀️ privacy-focused approach
- ✨ server validation helper for your nitro endpoints
- ⚡️ lightweight - script only loaded when required

## Installation

1. First, [follow these steps](https://developers.cloudflare.com/turnstile/get-started/) to obtain a free sitekey and secret key from Cloudflare.

2. Install and add `@nuxtjs/turnstile` to your `nuxt.config`.

   ```bash
   npx nuxi@latest module add turnstile
   ```

   ```js
   export default defineNuxtConfig({
     modules: ['@nuxtjs/turnstile'],

     turnstile: {
       siteKey: '<your-site-key>',
     },

     runtimeConfig: {
       turnstile: {
         // This can be overridden at runtime via the NUXT_TURNSTILE_SECRET_KEY
         // environment variable.
         secretKey: '',
       },
     },
   })
   ```

  Alternatively, you may set `turnstile.secretKeyPath` to a path to a file containing the secret key. This will be read at build-time and will override any other explicit `secretKey` you have set.

   **Tip**: At runtime you can override site and secret keys with the `NUXT_TURNSTILE_SECRET_KEY` and `NUXT_PUBLIC_TURNSTILE_SITE_KEY` environment variables.

## Usage

To use Turnstile, you will likely want to:

- Use the `<NuxtTurnstile>` component in your app (for example to build a contact form)
- Verify the token on your server, when you are processing an API request or a form submission (for example, before sending the email out)

### Client

To use Turnstile, add the auto-imported Vue component in whatever component needs it:

```html
<template>
  <div>
    <form @submit.prevent="onSubmit">
      <NuxtTurnstile v-model="token" />
      <input type="submit" />
    </form>
  </div>
</template>
```

`<NuxtTurnstile>` can take a number of options via the `options` argument. [See all options](./src/runtime/types.ts). It renders the Turnstile `<iframe>` within a `<div>` wrapper by default, but you can configure this by setting the `element` prop.

When in the page, it will automatically load the Turnstile script and validate your user. Each validation lasts for 300s, and `@nuxtjs/turnstile` will automatically revalidate this token after 250s.

You can access the validation token by setting a `v-model` on the component. Then, send the token along with your form responses, either explicitly or automatically (Cloudflare adds a hidden form element with the name `cf-turnstile-response` to your form). To validate the token on server-side, you can use the auto-imported `verifyTurnstileToken` utility in your Nitro server routes.

The turnstile token is no longer valid after being processed with CloudFlare via `verifyTurnstileToken`. If you are using @nuxtjs/turnstile with a component that might need to be validated multiple times, such as a submission form, you will need to regenerate the token for each submission. To manually regenerate the token, @nuxtjs/turnstile exposes the `reset` function directly via a [template ref](https://vuejs.org/guide/essentials/template-refs.html).

**Example**:

```html
<template>
  <NuxtTurnstile ref="turnstile" />
  <button @click="turnstile.reset()">Reset token in template</button>
  <button @click="reset()">Reset token from handler</button>
</template>

<script setup>
  // you can call this template ref anything
  const turnstile = ref()

  function reset() {
    turnstile.value?.reset()
  }
</script>
```

### Server

You can either use the a generated validation endpoint, or use the imported helper method:

**Example with endpoint**:

Turn on the generation of the endpoint first:

```js
export default defineNuxtConfig({
  // ...
  turnstile: {
    siteKey: '<your-site-key>',
    addValidateEndpoint: true
  },
})
```

You can now call the endpoint at `/_turnstile/validate` from the client to validate tokens.

**Example with custom endpoint and helper method**:

```js
// server/api/validateTurnstile.ts

export default defineEventHandler(async (event) => {
  const { token } = await readBody(event)

  if (!token) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Token not provided.',
    })
  }

  return await verifyTurnstileToken(token)
})
```

## 💻 Development

- Clone this repository
- Enable [Corepack](https://github.com/nodejs/corepack) using `corepack enable` (use `npm i -g corepack` for Node.js < 16.10)
- Install dependencies using `pnpm install`
- Stub module with `pnpm dev:prepare`
- Run `pnpm dev` to start [playground](./playground) in development mode

## Credits

- inspired by [laravel-cloudflare-turnstile](https://github.com/ryangjchandler/laravel-cloudflare-turnstile)

## License

Made with ❤️

Published under the [MIT License](./LICENCE).

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/@nuxtjs/turnstile?style=flat-square
[npm-version-href]: https://npmjs.com/package/@nuxtjs/turnstile
[npm-downloads-src]: https://img.shields.io/npm/dm/@nuxtjs/turnstile?style=flat-square
[npm-downloads-href]: https://npmjs.com/package/@nuxtjs/turnstile
[github-actions-src]: https://img.shields.io/github/actions/workflow/status/nuxt-modules/turnstile/ci.yml?style=flat-square
[github-actions-href]: https://github.com/nuxt-modules/turnstile/actions?query=workflow%3Aci
[codecov-src]: https://img.shields.io/codecov/c/gh/nuxt-modules/turnstile/main?style=flat-square
[codecov-href]: https://codecov.io/gh/nuxt-modules/turnstile
