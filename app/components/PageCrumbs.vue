<script setup lang="ts">
const emit = defineEmits<{ openMenu: [] }>()

const route = useRoute()

// Chaque segment du chemin devient un lien, sauf le dernier qui represente
// la page courante. C'est ce qui permet de remonter d'un cran (ou de revenir
// a l'accueil) sans passer par la sidebar.
const crumbs = computed(() => {
  const segments = route.path.split('/').filter(Boolean)

  return segments.map((segment, index) => ({
    label: segment.replace(/-/g, ' '),
    to: '/' + segments.slice(0, index + 1).join('/')
  }))
})
</script>

<template>
  <!--
    Deux contraintes indissociables :

    1. Cette barre ne peut PAS vivre dans PageBanner : la banniere porte
       `overflow-hidden`, et un ancetre avec un overflow non `visible` devient
       le conteneur de defilement — `sticky` ne s'applique alors plus jamais.

    2. Sa boite englobante doit etre haute (ici UMain, qui couvre toute la
       page). Un `sticky` ne se debloque qu'a la sortie de son parent : dans un
       parent de la hauteur de la banniere, il se detacherait aussitot.

    La marge negative egale a la hauteur fait chevaucher le bas de la banniere
    au repos, pour conserver exactement le rendu precedent.
  -->
  <nav
    aria-label="Fil d'Ariane"
    class="sticky top-0 z-20 -mt-9 flex h-9 items-center gap-2 overflow-x-auto
           border-t border-dashed border-default
           bg-white/80 px-6 backdrop-blur-sm sm:px-10 dark:bg-neutral-950/75"
  >
    <!-- Declencheur du tiroir mobile. La barre est deja collee en haut :
         elle sert d'en-tete sous lg sans ajouter d'element flottant. -->
    <button
      type="button"
      aria-label="Ouvrir le menu"
      class="-ml-1 flex size-6 shrink-0 items-center justify-center text-neutral-900 transition-opacity hover:opacity-60 lg:hidden dark:text-neutral-100"
      @click="emit('openMenu')"
    >
      <UIcon name="ph:list-bold" class="size-4" />
    </button>

    <NuxtLink
      to="/"
      class="flex shrink-0 items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.15em] text-neutral-900 transition-opacity hover:opacity-60 dark:text-neutral-100"
    >
      <UIcon name="ph:house-bold" class="size-3.5" />
      home
    </NuxtLink>

    <template v-for="(crumb, index) in crumbs" :key="crumb.to">
      <span class="shrink-0 text-neutral-900/30 dark:text-neutral-100/30">/</span>

      <NuxtLink
        v-if="index < crumbs.length - 1"
        :to="crumb.to"
        class="shrink-0 font-mono text-[11px] uppercase tracking-[0.15em] text-neutral-900 transition-opacity hover:opacity-60 dark:text-neutral-100"
      >
        {{ crumb.label }}
      </NuxtLink>

      <span
        v-else
        aria-current="page"
        class="shrink-0 font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-neutral-900 dark:text-neutral-100"
      >
        {{ crumb.label }}
      </span>
    </template>
  </nav>
</template>
