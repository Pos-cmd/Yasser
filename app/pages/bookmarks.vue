<script setup lang="ts">
interface BookmarkLink {
  label: string
  url: string
  note?: string
  type?: string
  date?: Date | string
  title?: string
  description?: string
  image?: string
  site?: string
}

const { contentPath } = useContentLocale()
const { monthYear } = useDateFormat()

const { data: doc } = await useAsyncData(
  () => `page-bookmarks-${contentPath.value}`,
  () => queryCollection('pages').path(contentPath.value).first()
)

if (!doc.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

const groups = computed(() => doc.value?.groups ?? [])

// Ces types ont un intitule qui se suffit a lui-meme : afficher le titre
// Open Graph ferait doublon et une miniature n'apporterait rien.
const TEXT_ONLY = new Set(['docs', 'tool', 'repo'])

function hostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  }
  catch {
    return url
  }
}

// Aucune cle d'API : le service de favicons de DuckDuckGo est libre.
function favicon(url: string) {
  return `https://icons.duckduckgo.com/ip3/${hostname(url)}.ico`
}

function showThumb(link: BookmarkLink) {
  return Boolean(link.image) && !!link.type && !TEXT_ONLY.has(link.type)
}

// Le titre OG n'est affiche que s'il apporte une information que le libelle
// choisi n'a pas deja : sinon on lit deux fois la meme chose.
function previewTitle(link: BookmarkLink) {
  if (!link.title || !link.type || TEXT_ONLY.has(link.type)) return null
  if (link.title.toLowerCase().includes(link.label.toLowerCase())) return null

  return link.title
}
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

    <div class="mt-12 space-y-12">
      <section v-for="group in groups" :key="group.label">
        <div class="flex items-baseline justify-between gap-4">
          <p class="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-dimmed">
            <UIcon v-if="group.icon" :name="group.icon" class="size-3.5 text-primary" />
            {{ group.label }}
          </p>
          <span class="font-mono text-[11px] text-dimmed">{{ group.links?.length ?? 0 }}</span>
        </div>

        <ul class="mt-4">
          <li v-for="link in group.links" :key="link.url">
            <a
              :href="link.url"
              target="_blank"
              rel="noopener noreferrer"
              class="group flex items-start gap-4 border-b border-dashed border-default py-4"
            >
              <span class="min-w-0 flex-1">
                <span class="flex items-center gap-2">
                  <img
                    :src="favicon(link.url)"
                    alt=""
                    width="16"
                    height="16"
                    loading="lazy"
                    decoding="async"
                    class="size-4 shrink-0"
                  >
                  <span class="text-sm font-medium text-highlighted transition-colors group-hover:text-primary">
                    {{ link.label }}
                  </span>
                  <span v-if="link.type" class="font-mono text-[10px] uppercase tracking-wider text-dimmed">
                    {{ link.type }}
                  </span>
                </span>

                <span class="mt-1 block truncate font-mono text-[11px] text-dimmed">
                  {{ hostname(link.url) }}
                  <template v-if="previewTitle(link)"> · {{ previewTitle(link) }}</template>
                  <template v-if="link.date"> · {{ monthYear(link.date) }}</template>
                </span>

                <span v-if="link.note" class="mt-2 block text-sm text-muted">
                  {{ link.note }}
                </span>
              </span>

              <!-- Miniature : uniquement quand le type s'y prete. C'est ce qui
                   evite le mur d'images quand la liste grandit. -->
              <img
                v-if="showThumb(link)"
                :src="link.image"
                alt=""
                loading="lazy"
                decoding="async"
                class="hidden h-16 w-24 shrink-0 border border-dashed border-default object-cover sm:block"
              >
            </a>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>
