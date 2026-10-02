<script setup lang="ts">
const { t } = useI18n()
const { contentPath } = useContentLocale()

const { data: doc } = await useAsyncData(
  () => `page-shelf-${contentPath.value}`,
  () => queryCollection('pages').path(contentPath.value).first()
)

if (!doc.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

const now = computed(() => doc.value?.now ?? [])
const items = computed(() => doc.value?.items ?? [])

const kindIcon: Record<string, string> = {
  manga: 'ph:books-bold',
  book: 'ph:book-bold',
  film: 'ph:film-strip-bold',
  music: 'ph:music-notes-bold',
  series: 'ph:television-bold'
}

// Nombre de livres qui tiennent sur une planche. Au-dela, une nouvelle planche
// est ouverte en dessous, comme sur une vraie etagere.
const SHELF_CAPACITY = 12

const kindOrder = ['manga', 'book', 'film', 'series', 'music']

function chunk<T>(list: T[], size: number): T[][] {
  const rows: T[][] = []

  for (let i = 0; i < list.length; i += size) {
    rows.push(list.slice(i, i + size))
  }

  return rows
}

const shelves = computed(() => {
  const groups = new Map<string, typeof items.value>()

  for (const entry of items.value) {
    const list = groups.get(entry.kind) ?? []
    list.push(entry)
    groups.set(entry.kind, list)
  }

  return kindOrder
    .filter(kind => groups.has(kind))
    .map((kind) => {
      const entries = groups.get(kind) ?? []

      return {
        kind,
        label: t(`shelf.kinds.${kind}`),
        total: entries.length,
        rows: chunk(entries, SHELF_CAPACITY).map((row, index) => ({
          key: `${kind}-${index}`,
          entries: row
        }))
      }
    })
})
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

    <!-- Right now -->
    <section v-if="now.length" class="mt-12 space-y-4">
      <p class="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-dimmed">
        <span class="relative flex size-2">
          <span class="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-75" />
          <span class="relative inline-flex size-2 rounded-full bg-success" />
        </span>
        {{ t('shelf.rightNow') }}
      </p>

      <ul class="grid gap-4 sm:grid-cols-3">
        <li
          v-for="entry in now"
          :key="entry.title"
          class="border border-dashed border-default"
        >
          <!-- object-contain : les pochettes carrees et les affiches 2:3 cohabitent
               sans etre recadrees. -->
          <img
            v-if="entry.cover"
            :src="entry.cover"
            :alt="t('shelf.coverAlt', { title: entry.title })"
            loading="lazy"
            decoding="async"
            class="h-44 w-full border-b border-dashed border-default bg-elevated object-contain p-2"
          >
          <div v-else class="flex h-44 w-full items-center justify-center border-b border-dashed border-default bg-elevated">
            <UIcon :name="kindIcon[entry.kind]" class="size-6 text-dimmed" />
          </div>

          <div class="p-3">
            <p class="text-sm font-medium text-highlighted">
              {{ entry.title }}
            </p>
            <p class="mt-0.5 text-[11px] text-dimmed">
              {{ [entry.creator, entry.volume ? `${t('shelf.volume')} ${entry.volume}` : null].filter(Boolean).join(' · ') }}
            </p>
            <p class="mt-2 text-xs text-muted">
              {{ entry.note }}
            </p>
          </div>
        </li>
      </ul>
    </section>

    <!-- Une bibliotheque : une section par categorie, une planche par rangee -->
    <div class="mt-12 space-y-12">
      <section v-for="shelf in shelves" :key="shelf.kind">
        <div class="flex items-baseline justify-between gap-4">
          <h2 class="font-sans text-[11px] font-semibold uppercase tracking-wider text-dimmed">
            {{ shelf.label }}
          </h2>
          <span class="font-mono text-[11px] text-dimmed">{{ shelf.total }}</span>
        </div>

        <div class="mt-4 space-y-5">
          <div v-for="row in shelf.rows" :key="row.key">
            <!-- scrollbar-hidden : les livres peuvent deborder si plusieurs
                 sont ouverts sur une planche deja bien remplie. -->
            <div class="overflow-x-auto scrollbar-hidden">
              <ul class="flex min-w-max items-end gap-1">
                <ShelfBook
                  v-for="entry in row.entries"
                  :key="`${entry.kind}-${entry.title}`"
                  :entry="entry"
                />
              </ul>
            </div>

            <!-- La planche -->
            <div class="border-b-2 border-dashed border-default" />
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
