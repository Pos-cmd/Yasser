<!-- layouts/default.vue -->

<script setup lang="ts">
import type { NavItem } from '~/types/nav';

const socials = [
  { label: 'X', icon: 'streamline-logos:x-twitter-logo-solid', to: 'https://x.com/' },
  // { label: 'Instagram', icon: 'streamline-logos:instagram-logo-2-solid', to: 'https://instagram.com/' },
  { label: 'GitHub', icon: 'ph:github-logo-bold', to: 'https://github.com/' },
  { label: 'Mail', icon: 'ph:paper-plane-tilt-bold', to: 'mailto:afolabiyasser06@gmail.com' }
]

const facts = [
  { icon: 'ph:cake-bold', label: '26 year old' },
  { icon: 'ph:book-open-bold', label: 'I really love to read manga' },
  // { icon: 'ph:barbell-bold', label: 'I try to workout' },
  { icon: 'ph:sparkle-bold', label: 'I would love to work on new things' }
]

const sections: NavItem[] = [
  { label: 'Home', to: '/', icon: 'ph:house-bold' },
  { label: 'About', to: '/about', icon: 'ph:user-bold' },
  { label: 'Experience', to: '/experience', icon: 'ph:briefcase-bold' },
  { label: 'Projects', to: '/projects', icon: 'ph:rocket-bold' },
  { label: 'Skills', to: '/skills', icon: 'ph:brain-bold' },
  { label: 'Notes', to: '/notes', icon: 'ph:pencil-simple-bold' },
  { label: 'Bookmarks', to: '/bookmarks', icon: 'ph:bookmark-simple-bold' }
]

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

const route = useRoute()

const isActive = (item: NavItem) =>
  route.path === item.to || route.path.startsWith(`${item.to}/`)
</script>

<template>
  <div class="flex space-x-4 min-h-screen bg-inherit bg-[repeating-linear-gradient(135deg,transparent_0,transparent_3px,var(--ui-border)_5px,var(--ui-border)_1px)]">
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
      <nav aria-label="Sections" class="lg:hidden">
        <ul class="space-y-0.5">
          <li v-for="item in sections" :key="item.to">
            <NuxtLink
              :to="item.to"
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
          <span class="flex items-center gap-2 text-sm font-semibold text-highlighted cursor-pointer">
            <UColorModeButton />
          </span>
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
            aria-label="Fermer le menu"
            class="lg:hidden"
            @click="close"
          />
        </div>
      </template>

      <!-- Identity -->
      <section class="space-y-3">
        <div class="flex items-center gap-3">
          <NuxtImg
            src="/image.png"
            alt="Portrait of Yasser"
            width="80"
            height="80"
            class="size-20 shrink-0 rounded-lg object-cover ring-1 ring-default"
          />
        </div>

        <p class="text-sm leading-relaxed text-muted">
          An enthusiastic dev who loves to try stuff and build new things — always curious, always shipping.
        </p>
      </section>

      <USeparator type="dashed" />

      <!-- Some info -->
      <section class="space-y-3">
        <p class="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-dimmed">
          <UIcon name="ph:info-bold" class="size-3.5 text-primary" />
          Some info
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
          I'm active now
        </p>

        <!-- Github Habit tracker -->
        <div class="rounded-lg border border-dashed border-default px-3 py-4 text-center">
          <UIcon name="ph:github-logo-bold" class="mx-auto size-5 text-dimmed" />
          <p class="mt-1.5 text-xs text-dimmed">
            GitHub activity — coming soon
          </p>
        </div>
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
