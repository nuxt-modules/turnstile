# Nuxt Turnstile

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![Github Actions][github-actions-src]][github-actions-href]
[![Codecov][codecov-src]][codecov-href]

> [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/) integration for [Nuxt 3](https://v3.nuxtjs.org)

- [✨ &nbsp;Changelog](https://github.com/danielroe/nuxt-turnstile/blob/main/CHANGELOG.md)
<!-- - [▶️ &nbsp;Online playground](https://stackblitz.com/github/danielroe/nuxt-turnstile/tree/main/playground) -->

## Features

- 💪 smart verification with minimal user interaction
- 🕵️‍♀️ privacy-focused approach
- ✨ server validation helper for your nitro endpoints
- ⚡️ lightweight - script only loaded when required

## Installation

1. First, [follow these steps](https://developers.cloudflare.com/turnstile/get-started/) to obtain a free sitekey and secret key from Cloudflare.

2. Install and add `nuxt-turnstile` to your `nuxt.config`.

   ```bash
   # Whichever matches your package manager
   pnpm add -D nuxt-turnstile
   npm install -D nuxt-turnstile
   yarn add -D nuxt-turnstile
   ```

   ```js
   export default defineNuxtConfig({
     modules: ['nuxt-turnstile'],
     runtimeConfig: {
       turnstile: {
         secretKey: process.env.NUXT_TURNSTILE_SECRET_KEY || '',
       },
     },
     turnstile: {
       siteKey: '<your-site-key>',
     },
   })
   ```
   
   **Tip**: At runtime you can override site and secret keys with the `NUXT_TURNSTILE_SECRET_KEY` and `NUXT_PUBLIC_TURNSTILE_SITE_KEY` environment variables.

## Usage

To use Turnstile, add the auto-imported Vue component in whatever component needs it:

```html
<template>
  <div>
    <form @submit.prevent="onSubmit">
      <Turnstile v-model="token" />
      <input type="submit" />
    </form>
  </div>
</template>
```

`<Turnstile>` can take a number of options via the `options` argument. [See all options](./src/runtime/types.ts). It renders the Turnstile `<iframe>` within a `<div>` wrapper by default, but you can configure this by setting the `element` prop.

When in the page, it will automatically load the Turnstile script and validate your user. Each validation lasts for 300s, and `nuxt-turnstile` will automatically revalidate this token after 250s.

You can access the validation token by setting a `v-model` on the component. Then, send the token along with your form responses, either explicitly or automatically (Cloudflare adds a hidden form element with the name `cf-turnstile-response` to your form). To validate the token on server-side, you can use the auto-imported `verifyTurnstileToken` utility in your Nitro server routes.

The turnstile token is no longer valid after being processed with CloudFlare via `verifyTurnstileToken`. If you are using nuxt-turnstile with a component that might need to be validated multiple times, such as a submission form, you will need to regenerate the token for each submission. To manually regenerate the token, nuxt-turnstile exposes the `reset` function. This function can be accessed either through the component itself, i.e:

```
<button @click="token.reset()">Reset Token</button>
```

Or, you can call the function programmatically. Remember that if you are using the Vue3 reactivity API for the token model that you will need to call `token.value.reset()`.

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

[npm-version-src]: https://img.shields.io/npm/v/nuxt-turnstile?style=flat-square
[npm-version-href]: https://npmjs.com/package/nuxt-turnstile
[npm-downloads-src]: https://img.shields.io/npm/dm/nuxt-turnstile?style=flat-square
[npm-downloads-href]: https://npmjs.com/package/nuxt-turnstile
[github-actions-src]: https://img.shields.io/github/workflow/status/danielroe/nuxt-turnstile/ci/main?style=flat-square
[github-actions-href]: https://github.com/danielroe/nuxt-turnstile/actions?query=workflow%3Aci
[codecov-src]: https://img.shields.io/codecov/c/gh/danielroe/nuxt-turnstile/main?style=flat-square
[codecov-href]: https://codecov.io/gh/danielroe/nuxt-turnstile
