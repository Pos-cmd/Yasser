<script setup lang="ts">
const { t } = useI18n()
const { inLocale, localeHref } = useContentLocale()

const { data } = await useAsyncData('projects-list', () =>
  queryCollection('projects').order('order', 'ASC').all()
)

// La collection contient les deux langues a plat : on ne garde que la locale
// active.
const projects = computed(() => (data.value ?? []).filter(project => inLocale(project.path)))

// Placeholder tant qu'il n'y a pas de capture : la grille reste presentable
// et chaque projet a sa propre teinte, la meme que sa banniere de page.
function placeholderStyle(seed: string) {
  const { h1, h3 } = useHue(seed)

  return {
    backgroundImage: `linear-gradient(115deg, oklch(0.93 0.04 ${h1}), oklch(0.90 0.045 ${h3}))`
  }
}
</script>

<template>
  <div>
    <header>
      <h1 class="text-3xl text-highlighted sm:text-4xl">
        {{ t('projects.title') }}
      </h1>
      <p class="mt-3 text-muted">
        {{ t('projects.description') }}
      </p>
    </header>

    <ul class="mt-12 grid gap-4 sm:grid-cols-2">
      <li v-for="project in projects" :key="project.path">
        <NuxtLink
          :to="localeHref(project.path)"
          class="group flex h-full flex-col overflow-hidden border border-dashed border-default"
        >
          <!-- Visuel : capture si elle existe, sinon placeholder derive de la hue -->
          <div class="relative aspect-video overflow-hidden border-b border-dashed border-default">
            <img
              v-if="project.cover"
              :src="project.cover"
              :alt="t('projects.previewAlt', { title: project.title })"
              loading="lazy"
              decoding="async"
              class="size-full object-cover transition-transform duration-500 group-hover:scale-105"
            >
            <div
              v-else
              class="flex size-full items-center justify-center px-4 text-center"
              :style="placeholderStyle(project.path)"
            >
              <span class="font-mono text-xs uppercase tracking-[0.2em] text-neutral-700 dark:text-neutral-300">
                {{ project.title }}
              </span>
            </div>
          </div>

          <div class="flex flex-1 flex-col p-5">
            <div class="flex items-start justify-between gap-3">
              <h2 class="text-lg text-highlighted transition-colors group-hover:text-primary">
                {{ project.title }}
              </h2>
              <span v-if="project.year" class="mt-1 shrink-0 font-mono text-xs text-dimmed">
                {{ project.year }}
              </span>
            </div>

            <p class="mt-2 text-sm text-muted">
              {{ project.description }}
            </p>

            <ul v-if="project.stack?.length" class="mt-auto flex flex-wrap gap-1.5 pt-4">
              <li
                v-for="tech in project.stack"
                :key="tech"
                class="border border-dashed border-default px-2 py-0.5 text-[11px] text-dimmed"
              >
                {{ tech }}
              </li>
            </ul>
          </div>
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>
