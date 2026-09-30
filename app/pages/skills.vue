<script setup lang="ts">
const { data: doc } = await useAsyncData('page-skills', () =>
  queryCollection('pages').path('/skills').first()
)

if (!doc.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

const groups = computed(() => doc.value?.groups ?? [])
</script>

<template>
  <div>
    <header>
      <h1 class="text-3xl text-highlighted sm:text-4xl">
        {{ doc?.title }}
      </h1>
      <p v-if="doc?.description" class="mt-3 text-muted">
        {{ doc.description }}
      </p>
    </header>

    <div v-if="doc" class="mt-6 text-toned">
      <ContentRenderer :value="doc" />
    </div>

    <div class="mt-12 space-y-10">
      <section
        v-for="group in groups"
        :key="group.label"
        class="space-y-4"
      >
        <p class="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-dimmed">
          <UIcon v-if="group.icon" :name="group.icon" class="size-3.5 text-primary" />
          {{ group.label }}
        </p>

        <ul class="flex flex-wrap gap-2">
          <li
            v-for="item in group.items"
            :key="item.label"
            class="flex items-center gap-2 border border-dashed border-default px-2.5 py-1.5 text-sm text-toned"
          >
            <UIcon v-if="item.icon" :name="item.icon" class="size-4 shrink-0" />
            {{ item.label }}
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>
