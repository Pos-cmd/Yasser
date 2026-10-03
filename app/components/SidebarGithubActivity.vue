<script setup lang="ts">
interface GithubActivity {
  total: number
  publicRepos: number
  currentStreak: number
  longestStreak: number
  weeks: (number | null)[][]
}

const { t } = useI18n()
const config = useRuntimeConfig()

// Donnees incluses dans le payload SSR : aucune requete ne part du navigateur.
const { data } = await useAsyncData('github-activity', () =>
  $fetch<GithubActivity | null>('/api/github-activity')
)

const activity = computed(() => data.value ?? null)

const profileUrl = computed(() => `https://github.com/${config.public.githubUser}`)

// Niveaux relatifs au jour le plus actif : l'echelle reste lisible aussi bien
// sur un profil tres actif que sur un profil calme, contrairement a des seuils
// fixes. Meme logique que le damier de GitHub.
const LEVELS = [
  'bg-elevated',
  'bg-primary/20',
  'bg-primary/40',
  'bg-primary/65',
  'bg-primary'
]

const peak = computed(() => {
  const counts = (activity.value?.weeks ?? [])
    .flat()
    .filter((count): count is number => typeof count === 'number')

  return Math.max(1, ...counts)
})

function levelClass(count: number | null) {
  if (!count) return LEVELS[0]

  const ratio = count / peak.value
  if (ratio <= 0.25) return LEVELS[1]
  if (ratio <= 0.5) return LEVELS[2]
  if (ratio <= 0.75) return LEVELS[3]

  return LEVELS[4]
}
</script>

<template>
  <NuxtLink
    v-if="activity"
    :to="profileUrl"
    target="_blank"
    rel="noopener noreferrer"
    class="group block rounded-lg border border-dashed border-default px-3 py-3 transition-colors hover:border-primary/50"
  >
    <p class="flex items-center gap-2">
      <UIcon name="ph:github-logo-bold" class="size-3.5 shrink-0 text-primary" />
      <span class="text-[11px] font-semibold uppercase tracking-wider text-dimmed">
        {{ t('sidebar.githubActivity') }}
      </span>
      <UIcon
        name="ph:arrow-up-right-bold"
        class="ml-auto size-3 shrink-0 text-dimmed transition-colors group-hover:text-primary"
      />
    </p>

    <p class="mt-2 text-sm font-medium text-highlighted">
      {{ t('sidebar.githubContributions', activity.total) }}
    </p>
    <p class="text-[11px] text-dimmed">
      {{ t('sidebar.githubLast12Months') }}
    </p>

    <!--
      Damier purement decoratif : ses 182 cases seraient illisibles au lecteur
      d'ecran, et les chiffres qui comptent sont deja en texte juste au-dessus
      et en dessous.
    -->
    <div
      class="mt-2.5 grid grid-flow-col grid-rows-7 gap-0.5"
      aria-hidden="true"
    >
      <template v-for="(week, index) in activity.weeks" :key="index">
        <span
          v-for="(count, day) in week"
          :key="`${index}-${day}`"
          class="aspect-square rounded-[2px]"
          :class="levelClass(count)"
        />
      </template>
    </div>

    <p class="mt-2.5 flex items-baseline justify-between gap-2 font-mono text-[10px] text-dimmed">
      <span>
        {{ t('sidebar.githubCurrentStreak') }}
        <span class="text-toned">{{ t('sidebar.githubDays', activity.currentStreak) }}</span>
      </span>
      <span>
        {{ t('sidebar.githubLongestStreak') }}
        <span class="text-toned">{{ t('sidebar.githubDays', activity.longestStreak) }}</span>
      </span>
    </p>

    <p class="mt-0.5 font-mono text-[10px] text-dimmed">
      {{ t('sidebar.githubPublicRepos', activity.publicRepos) }}
    </p>

    <span class="sr-only">{{ t('sidebar.githubOpenProfile') }}</span>
  </NuxtLink>

  <!-- Repli : jeton absent, invalide ou GitHub injoignable. -->
  <div
    v-else
    class="rounded-lg border border-dashed border-default px-3 py-4 text-center"
  >
    <UIcon name="ph:github-logo-bold" class="mx-auto size-5 text-dimmed" />
    <p class="mt-1.5 text-xs text-dimmed">
      {{ t('sidebar.githubUnavailable') }}
    </p>
  </div>
</template>
