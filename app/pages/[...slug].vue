<script setup lang="ts">
const route = useRoute()

// Les pages vivent dans plusieurs collections : on interroge chacune
// et on garde la premiere qui correspond au chemin courant.
const { data: page } = await useAsyncData(`page-${route.path}`, async () => {
  const path = route.path

  return (
    (await queryCollection('pages').path(path).first()) ??
    (await queryCollection('notes').path(path).first()) ??
    (await queryCollection('projects').path(path).first()) ??
    (await queryCollection('experience').path(path).first()) ??
    null
  )
})

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}
</script>

<template>
  <ContentRenderer
    v-if="page"
    :value="page"
  />
</template>
