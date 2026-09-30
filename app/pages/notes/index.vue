<script setup lang="ts">
const { data } = await useAsyncData('notes-list', () =>
  queryCollection('notes').order('date', 'DESC').all()
)

// Les brouillons sont filtres cote rendu plutot que dans la requete : le champ
// est un booleen stocke en entier, et la comparaison SQL n'est pas evidente.
const notes = computed(() => (data.value ?? []).filter(note => !note.draft))

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatDate(value: Date | string) {
  const date = new Date(value)
  return `${MONTHS[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`
}
</script>

<template>
  <div>
    <header>
      <h1 class="text-3xl text-highlighted sm:text-4xl">
        Notes
      </h1>
      <p class="mt-3 text-muted">
        Small things I had to work out, written down so I don't have to work them out twice.
      </p>
    </header>

    <ul class="mt-12">
      <li v-for="note in notes" :key="note.path">
        <NuxtLink
          :to="note.path"
          class="group block border-b border-dashed border-default py-6"
        >
          <p class="font-mono text-xs text-dimmed">
            {{ formatDate(note.date) }}
          </p>

          <h2 class="mt-2 text-xl text-highlighted transition-colors group-hover:text-primary">
            {{ note.title }}
          </h2>

          <p class="mt-1 text-sm text-muted">
            {{ note.description }}
          </p>

          <ul v-if="note.tags?.length" class="mt-3 flex flex-wrap gap-1.5">
            <li
              v-for="tag in note.tags"
              :key="tag"
              class="border border-dashed border-default px-2 py-0.5 text-[11px] text-dimmed"
            >
              {{ tag }}
            </li>
          </ul>
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>
