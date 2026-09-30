<script setup lang="ts">
useSeoMeta({
  title: 'Yasser — Developer',
  description: 'Developer based in France, building web applications with Vue, Nuxt and Laravel.'
})

const { data } = await useAsyncData('home-latest-notes', () =>
  queryCollection('notes').order('date', 'DESC').all()
)

const latest = computed(() =>
  (data.value ?? []).filter(note => !note.draft).slice(0, 3)
)

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatDate(value: Date | string) {
  const date = new Date(value)
  return `${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`
}
</script>

<template>
  <div>
    <p class="font-mono text-xs uppercase tracking-wider text-dimmed">
      Lyon, France
    </p>

    <h1 class="mt-5 text-4xl leading-[1.05] text-highlighted sm:text-5xl lg:text-6xl">
      I build web things<br>
      <span class="text-muted">and try to keep them simple.</span>
    </h1>

    <p class="mt-8 max-w-prose text-base leading-relaxed text-toned">
      I'm Yasser, a developer working mostly with Vue, Nuxt and Laravel. I like the part
      where a vague idea turns into something people actually use — and I like it even more
      when the code underneath is still readable a year later.
    </p>

    <p class="mt-4 max-w-prose text-base leading-relaxed text-toned">
      This place keeps the professional side and the rest of it together. Start with
      <NuxtLink to="/about" class="text-highlighted underline decoration-dashed underline-offset-4 transition-colors hover:text-primary">about</NuxtLink>
      if you want the longer version, or go straight to
      <NuxtLink to="/projects" class="text-highlighted underline decoration-dashed underline-offset-4 transition-colors hover:text-primary">projects</NuxtLink>.
    </p>

    <section v-if="latest.length" class="mt-20">
      <div class="flex items-baseline justify-between gap-4">
        <p class="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-dimmed">
          <UIcon name="ph:pencil-simple-bold" class="size-3.5 text-primary" />
          Latest notes
        </p>

        <NuxtLink
          to="/notes"
          class="text-xs text-muted transition-colors hover:text-primary"
        >
          All notes
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
              {{ formatDate(note.date) }}
            </span>
          </NuxtLink>
        </li>
      </ul>
    </section>
  </div>
</template>
