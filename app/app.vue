<script setup lang="ts">
const localeHead = useLocaleHead()

// `useLocaleHead` calcule les balises liees aux langues — les
// `<link rel="alternate" hreflang>`, `og:locale:alternate` et le `lang` de
// `<html>` — mais ne les applique pas lui-meme : il faut les confier a
// `useHead`. Nuxt SEO gere le canonical et l'Open Graph, pas les alternates.
// Les valeurs sont passees en `computed` pour suivre les changements de langue.
useHead({
  htmlAttrs: computed(() => localeHead.value.htmlAttrs ?? {}),
  link: computed(() => localeHead.value.link ?? []),
  meta: computed(() => localeHead.value.meta ?? [])
})
</script>

<template>
  <NuxtRouteAnnouncer />
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
