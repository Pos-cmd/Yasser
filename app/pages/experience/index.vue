<script setup lang="ts">
const { t } = useI18n()
const { inLocale, localeHref } = useContentLocale()
const { monthYear } = useDateFormat()

// La collection contient les deux langues a plat : on ne garde que la locale
// active. Le filtrage est fait cote rendu, la requete reste simple.
const { data } = await useAsyncData('experience-list', () =>
  queryCollection('experience').order('order', 'ASC').all()
)

const entries = computed(() => (data.value ?? []).filter(entry => inLocale(entry.path)))
</script>

<template>
  <div>
    <header>
      <h1 class="text-3xl text-highlighted sm:text-4xl">
        {{ t('experience.title') }}
      </h1>
      <p class="mt-3 text-muted">
        {{ t('experience.description') }}
      </p>
    </header>

    <ol class="mt-12">
      <li v-for="entry in entries" :key="entry.path">
        <NuxtLink
          :to="localeHref(entry.path)"
          class="group block border-b border-dashed border-default py-6"
        >
          <p class="font-mono text-xs text-dimmed">
            {{ monthYear(entry.start) }} — {{ monthYear(entry.end) }}
          </p>

          <h2 class="mt-2 text-xl text-highlighted transition-colors group-hover:text-primary">
            {{ entry.role }}
          </h2>

          <p class="mt-1 text-sm text-muted">
            {{ entry.company }}
            <span v-if="entry.location"> · {{ entry.location }}</span>
          </p>

          <ul v-if="entry.stack?.length" class="mt-4 flex flex-wrap gap-1.5">
            <li
              v-for="tech in entry.stack"
              :key="tech"
              class="border border-dashed border-default px-2 py-0.5 text-[11px] text-dimmed"
            >
              {{ tech }}
            </li>
          </ul>
        </NuxtLink>
      </li>
    </ol>
  </div>
</template>
