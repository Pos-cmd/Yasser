<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const { items } = defineProps<{ items: NavigationMenuItem[] }>()

const slug = (name?: string) =>
  '#' + (name ?? '').toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
</script>

<template>
  <nav
    aria-label="Navigation des sections"
    class="fixed right-0 top-1/2 z-10 -translate-y-1/2
           flex flex-col items-end"
  >
    <a
      v-for="(item, i) in items"
      :key="i"
      :href="slug(item.name)"
      :aria-current="item.active ? 'true' : undefined"
      class="group flex w-full cursor-pointer items-center justify-end gap-3
             py-1 pl-10 pr-3 outline-none
             transition-[padding] duration-200 ease-out"
      :class="!item.active && 'hover:py-2.5'"
    >
      <!-- Titre : caché, apparaît au hover / focus -->
      <span
        class="pointer-events-none translate-x-2 whitespace-nowrap text-xs font-medium
               tracking-wide text-highlighted opacity-0
               transition-all duration-200 ease-out
               group-hover:translate-x-0 group-hover:opacity-100
               group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
        :class="item.active && 'translate-x-0 text-primary opacity-100'"
      >
        {{ item.name }}
      </span>

      <!-- Trait : hauteur figée, seule la largeur bouge -->
      <span
        class="shrink-0 transition-[width,background-color] duration-200 ease-out"
        :class="item.active
          ? 'h-0.5 w-24 bg-primary'
          : 'h-px w-8 bg-muted group-hover:w-18 group-hover:bg-primary'"
      />
    </a>
  </nav>
</template>
