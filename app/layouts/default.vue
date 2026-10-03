<!-- layouts/default.vue -->

<script setup lang="ts">
import type { NavItem } from '~/types/nav';

const { t } = useI18n()
const { basePath, localeHref } = useContentLocale()

const socials = [
  { label: 'LinkedIn', icon: 'streamline-logos:linkedin-logo-solid', to: 'https://www.linkedin.com/in/yasser-salami-djima-8922ab246' },
  { label: 'GitHub', icon: 'ph:github-logo-bold', to: 'https://github.com/pos-cmd' },
  { label: 'Mail', icon: 'ph:paper-plane-tilt-bold', to: 'mailto:afolabiyasser06@gmail.com' }
]

const facts = computed(() => [
  { icon: 'ph:map-pin-bold', label: t('facts.location') },
  { icon: 'ph:cake-bold', label: t('facts.age') },
  { icon: 'ph:code-bold', label: t('facts.stack') },
  { icon: 'ph:book-open-bold', label: t('facts.manga') }
])

const sections = computed<NavItem[]>(() => [
  { label: t('nav.home'), to: '/', icon: 'ph:house-bold' },
  { label: t('nav.about'), to: '/about', icon: 'ph:user-bold' },
  { label: t('nav.experience'), to: '/experience', icon: 'ph:briefcase-bold' },
  { label: t('nav.projects'), to: '/projects', icon: 'ph:rocket-bold' },
  { label: t('nav.skills'), to: '/skills', icon: 'ph:brain-bold' },
  { label: t('nav.notes'), to: '/notes', icon: 'ph:pencil-simple-bold' },
  { label: t('nav.bookmarks'), to: '/bookmarks', icon: 'ph:bookmark-simple-bold' }
])

// USidebar partage la MEME prop entre le tiroir mobile et l'effondrement
// desktop : `open` lit `openMobile` sous 1024px, `modelOpen` au-dessus. Le
// composant sauvegarde lui-meme l'etat desktop dans `desktopOpen` au passage
// en mobile, puis le restaure.
//
// Consequences : il faut (1) demarrer a true, (2) piloter en TOGGLE et non en
// affectation — ecrire `true` alors que la valeur l'est deja ne change aucune
// prop et ne declenche donc pas le watch interne. Et surtout (3) ne PAS
// reecrire cette valeur depuis l'exterieur pendant la bascule : on ecraserait
// le `desktopOpen` que le composant vient de sauvegarder.
const sidebarOpen = ref(true)

// `basePath` est le chemin courant prive de son prefixe de locale : les entrees
// de navigation restent ecrites en clair (`/about`) et non `/fr/about`.
const isActive = (item: NavItem) =>
  basePath.value === item.to || basePath.value.startsWith(`${item.to}/`)
</script>

<template>
  <div class="flex space-x-4 min-h-screen bg-[repeating-linear-gradient(135deg,transparent_0,transparent_3px,var(--ui-border)_5px,var(--ui-border)_1px)]">
    <USidebar
      v-model:open="sidebarOpen"
      :ui="{
        root: 'lg:[--sidebar-width:19rem]',
        container: `
          bg-default
          border-dashed
        `,
        header: 'px-4 py-3 border-dashed',
        body: 'gap-6 scrollbar-hidden'
      }"
    >
      <nav :aria-label="t('aria.sections')" class="lg:hidden">
        <ul class="space-y-0.5">
          <li v-for="item in sections" :key="item.to">
            <NuxtLink
              :to="localeHref(item.to)"
              class="flex items-center gap-2.5 px-2 py-2 text-sm transition-colors"
              :class="isActive(item)
                ? 'bg-elevated font-medium text-primary'
                : 'text-toned hover:bg-elevated hover:text-highlighted'"
              @click="sidebarOpen = false"
            >
              <UIcon :name="item.icon" class="size-4 shrink-0" />
              {{ item.label }}
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <USeparator type="dashed" class="lg:hidden" />

      <template #header="{ close }">
        <div class="flex w-full items-center justify-between gap-2">
          <div class="flex items-center gap-2 text-sm font-semibold text-highlighted">
            <UColorModeButton />
            <PageLangSwitcher />
          </div>
          <div class="flex items-center gap-0.5">
        <UButton
          v-for="social in socials"
          :key="social.label"
          :to="social.to"
          :icon="social.icon"
          :aria-label="social.label"
          rel="noopener noreferrer"
          target="_blank"
          color="neutral"
          variant="ghost"
          size="sm"
          square
        />
      </div>

          <!-- Le slot #header remplace l'en-tete par defaut de USidebar :
               la croix de fermeture du tiroir doit donc etre posee ici. -->
          <UButton
            icon="ph:x-bold"
            color="neutral"
            variant="ghost"
            size="sm"
            square
            :aria-label="t('aria.closeMenu')"
            class="lg:hidden"
            @click="close"
          />
        </div>
      </template>

      <!-- Identity -->
      <section class="space-y-3">
        <div class="flex items-center gap-3">
          <ProfileMascot
            class="[--mascot-size:5rem] shrink-0 rounded-lg"
            :source-width="540"
          />
        </div>

        <p class="text-sm leading-relaxed text-muted">
          {{ t('sidebar.blurb') }}
        </p>
      </section>

      <USeparator type="dashed" />

      <!-- Some info -->
      <section class="space-y-3">
        <p class="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-dimmed">
          <UIcon name="ph:info-bold" class="size-3.5 text-primary" />
          {{ t('sidebar.someInfo') }}
        </p>

        <ul class="space-y-2.5">
          <li v-for="fact in facts" :key="fact.label" class="flex items-start gap-2.5">
            <UIcon :name="fact.icon" class="mt-0.5 size-4 shrink-0 text-dimmed" />
            <span class="text-sm leading-snug text-toned">{{ fact.label }}</span>
          </li>
        </ul>
      </section>

      <USeparator type="dashed" />

      <!-- Currently active -->
      <section class="space-y-3">
        <p class="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-dimmed">
          <span class="relative flex size-2">
            <span class="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-75" />
            <span class="relative inline-flex size-2 rounded-full bg-success" />
          </span>
          {{ t('sidebar.activeNow') }}
        </p>

        <!-- Activite GitHub : damier + chiffres cles. Repli automatique sur une
             carte d'attente si aucun jeton n'est configure ou si GitHub ne
             repond pas (voir server/api/github-activity.get.ts). -->
        <SidebarGithubActivity />
      </section>
    </USidebar>

    <UMain class="bg-default min-w-0 flex-1 border-s border-default border-dashed">
      <PageBanner />
      <PageCrumbs @open-menu="sidebarOpen = !sidebarOpen" />
      <!-- lg:pr-40 reserve la gouttiere de la navigation de droite. Il faut la
           place du libelle au survol PLUS celle du trait actif (w-24). -->
      <div class="mx-auto w-full max-w-3xl px-6 py-12 sm:px-10 sm:py-16 lg:py-24 lg:pr-40">
        <slot />
      </div>
      <PageAnchor :items="sections"/>
    </UMain>
  </div>
</template>
