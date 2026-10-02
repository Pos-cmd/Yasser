<script setup lang="ts">
import type { NavItem } from '~/types/nav';

const { items } = defineProps<{ items: NavItem[] }>()

const { t } = useI18n()
const { basePath, localeHref } = useContentLocale()

const isActive = (item: NavItem) =>
  basePath.value === item.to || basePath.value.startsWith(`${item.to}/`)
</script>

<template>
  <nav
    :aria-label="t('aria.sectionNav')"
    class="fixed right-0 top-1/2 z-10 hidden -translate-y-1/2
           flex-col items-end lg:flex"
  >
    <NuxtLink
      v-for="item in items"
      :key="item.to"
      :to="localeHref(item.to)"
      :aria-current="isActive(item) ? 'page' : undefined"
      class="group relative flex w-full cursor-pointer items-center justify-end gap-3
             py-1 pl-2 pr-3 outline-none
             transition-[padding] duration-200 ease-out"
      :class="!isActive(item) && 'hover:py-2.5'"
    >
      <!-- Titre : en position absolue pour ne PAS reserver de largeur au repos.
           En flux, il elargissait la nav a 164px alors qu'il etait invisible. -->
      <span
        class="pointer-events-none absolute right-full mr-3 whitespace-nowrap
               font-mono text-[10px] uppercase tracking-[0.15em]
               translate-x-2 opacity-0
               transition-all duration-200 ease-out
               group-hover:translate-x-0 group-hover:opacity-100
               group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
        :class="isActive(item) ? 'text-primary' : 'text-highlighted'"
      >
        {{ item.label }}
      </span>

      <!-- Icone : visible en permanence. Les traits seuls ne signalaient pas
           qu'il y avait une navigation, surtout quand rien n'est actif. -->
      <UIcon
        :name="item.icon ?? 'ph:dot-bold'"
        class="size-4 shrink-0 transition-colors duration-200"
        :class="isActive(item) ? 'text-primary' : 'text-dimmed group-hover:text-primary'"
      />

      <!-- Trait : hauteur figée, seule la largeur bouge -->
      <span
        class="shrink-0 transition-[width,background-color] duration-200 ease-out"
        :class="isActive(item)
          ? 'h-0.5 w-24 bg-primary'
          : 'h-px w-8 bg-muted group-hover:w-18 group-hover:bg-primary'"
      />
    </NuxtLink>
  </nav>
</template>
