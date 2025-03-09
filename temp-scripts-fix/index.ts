import { defineNuxtModule, useNuxt } from 'nuxt/kit'

export default defineNuxtModule({
  meta: {
    name: 'temp-scripts-fix',
  },
  setup() {
    const nuxt = useNuxt()

    nuxt.hook('components:extend', (components) => {
      for (const c of [...components]) {
        if (c.filePath.includes('@nuxt/scripts')) {
          components.splice(components.indexOf(c), 1)
        }
      }
    })
  },
})
