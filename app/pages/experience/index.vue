<script setup lang="ts">
const { data: entries } = await useAsyncData('experience-list', () =>
  queryCollection('experience').order('order', 'ASC').all()
)

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Formatage manuel plutot que toLocaleDateString : le rendu serveur et le rendu
// client doivent produire exactement la meme chaine, sinon hydration mismatch.
function formatDate(value?: Date | string | null) {
  if (!value) return 'Present'
  const date = new Date(value)
  return `${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`
}
</script>

<template>
  <div>
    <header>
      <h1 class="text-3xl text-highlighted sm:text-4xl">
        Experience
      </h1>
      <p class="mt-3 text-muted">
        Where I've worked, what I was responsible for, and what I took away from it.
      </p>
    </header>

    <ol class="mt-12">
      <li v-for="entry in entries" :key="entry.path">
        <NuxtLink
          :to="entry.path"
          class="group block border-b border-dashed border-default py-6"
        >
          <p class="font-mono text-xs text-dimmed">
            {{ formatDate(entry.start) }} — {{ formatDate(entry.end) }}
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
