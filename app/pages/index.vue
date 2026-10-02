<script setup lang="ts">
const { t } = useI18n()
const { inLocale, localeHref } = useContentLocale()
const { fullDate } = useDateFormat()

useSeoMeta({
  title: () => t('seo.homeTitle'),
  description: () => t('seo.homeDescription')
})

const { data } = await useAsyncData('home-latest-notes', () =>
  queryCollection('notes').order('date', 'DESC').all()
)

// La collection contient les deux langues : on ne garde que la locale active
// avant de prendre les trois notes les plus recentes.
const latest = computed(() =>
  (data.value ?? []).filter(note => !note.draft && inLocale(note.path)).slice(0, 3)
)
</script>

<template>
  <div>
    <p class="font-mono text-xs uppercase tracking-wider text-dimmed">
      {{ t('home.location') }}
    </p>

    <h1 class="mt-5 text-4xl leading-[1.05] text-highlighted sm:text-5xl lg:text-6xl">
      {{ t('home.title1') }}<br>
      <span class="text-muted">{{ t('home.title2') }}</span>
    </h1>

    <p class="mt-8 max-w-prose text-base leading-relaxed text-toned">
      {{ t('home.intro1') }}
    </p>

    <p class="mt-4 max-w-prose text-base leading-relaxed text-toned">
      {{ t('home.intro2Before') }}
      <NuxtLink :to="localeHref('/about')" class="text-highlighted underline decoration-dashed underline-offset-4 transition-colors hover:text-primary">{{ t('home.linkAbout') }}</NuxtLink>
      {{ t('home.intro2Middle') }}
      <NuxtLink :to="localeHref('/projects')" class="text-highlighted underline decoration-dashed underline-offset-4 transition-colors hover:text-primary">{{ t('home.linkProjects') }}</NuxtLink>{{ t('home.intro2After') }}
    </p>

    <section v-if="latest.length" class="mt-20">
      <div class="flex items-baseline justify-between gap-4">
        <p class="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-dimmed">
          <UIcon name="ph:pencil-simple-bold" class="size-3.5 text-primary" />
          {{ t('home.latestNotes') }}
        </p>

        <NuxtLink
          :to="localeHref('/notes')"
          class="text-xs text-muted transition-colors hover:text-primary"
        >
          {{ t('home.allNotes') }}
        </NuxtLink>
      </div>

      <ul class="mt-5">
        <li v-for="note in latest" :key="note.path">
          <NuxtLink
            :to="note.path"
            class="group flex items-baseline justify-between gap-6 border-b border-dashed border-default py-4"
          >
            <span class="min-w-0">
              <span class="block text-sm font-medium text-highlighted transition-colors group-hover:text-primary">
                {{ note.title }}
              </span>
              <span class="mt-0.5 block text-sm text-muted">
                {{ note.description }}
              </span>
            </span>

            <span class="shrink-0 font-mono text-xs text-dimmed">
              {{ fullDate(note.date) }}
            </span>
          </NuxtLink>
        </li>
      </ul>
    </section>
  </div>
</template>
