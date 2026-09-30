<script setup lang="ts">
interface ShelfEntry {
  title: string
  kind: string
  creator?: string
  year?: number
  volume?: number
  cover?: string
  note: string
}

const { entry } = defineProps<{ entry: ShelfEntry }>()

const open = ref(false)

// Teinte propre a chaque livre : c'est ce qui donne l'effet "rangee de
// reliures" plutot qu'une suite de rectangles identiques.
const spineStyle = computed(() => ({
  '--spine-h': useHue(`${entry.kind}-${entry.title}`).h1
}))

const kindLabel: Record<string, string> = {
  manga: 'Manga',
  book: 'Book',
  film: 'Film',
  music: 'Music',
  series: 'Series'
}

const meta = computed(() =>
  [
    kindLabel[entry.kind],
    entry.creator,
    entry.volume ? `Vol. ${entry.volume}` : null
  ].filter(Boolean).join(' · ')
)
</script>

<template>
  <li
    class="shelf-book"
    :class="{ 'is-open': open }"
    :style="spineStyle"
  >
    <button
      type="button"
      class="shelf-book__inner"
      :aria-expanded="open"
      :aria-label="`${entry.title} — ${meta}`"
      @click="open = !open"
    >
      <!-- Tranche : ce qu'on voit au repos -->
      <span class="shelf-book__spine">
        <span class="shelf-book__label">{{ entry.title }}</span>
        <span class="shelf-book__mark">
          {{ entry.volume ?? kindLabel[entry.kind]?.charAt(0) }}
        </span>
      </span>

      <!-- Couverture : pivote depuis la charniere gauche -->
      <span class="shelf-book__cover">
        <img
          v-if="entry.cover"
          :src="entry.cover"
          alt=""
          loading="lazy"
          decoding="async"
          class="size-full object-cover"
        >

        <span class="shelf-book__info">
          <span class="block text-xs font-medium text-white">{{ entry.title }}</span>
          <span class="mt-0.5 block text-[11px] text-white/65">{{ meta }}</span>
          <span class="mt-1.5 line-clamp-2 block text-[11px] text-white/80">{{ entry.note }}</span>
        </span>
      </span>
    </button>
  </li>
</template>

<style scoped>
.shelf-book {
  width: 1.75rem;
  height: 14rem;
  flex-shrink: 0;
  transition: width 0.45s cubic-bezier(0.22, 1, 0.36, 1);
}

.shelf-book.is-open {
  width: 9rem;
}

.shelf-book__inner {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  cursor: pointer;
  text-align: left;
  outline: none;
  /* Le perspective doit etre sur le PARENT de l'element transforme,
     sinon la rotation est plate. */
  perspective: 1000px;
}

/* ---------------------------------------------------------------- tranche */

.shelf-book__spine {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  overflow: hidden;
  padding: 0.75rem 0;
  background: oklch(0.88 0.045 var(--spine-h));
  border: 1px solid oklch(0.79 0.04 var(--spine-h));
  transition: opacity 0.2s ease;
}

.shelf-book.is-open .shelf-book__spine {
  opacity: 0;
}

.shelf-book__label {
  writing-mode: vertical-rl;
  max-height: 9.5rem;
  overflow: hidden;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.06em;
  color: oklch(0.36 0.03 var(--spine-h));
}

.shelf-book__mark {
  font-family: var(--font-mono);
  font-size: 10px;
  color: oklch(0.45 0.03 var(--spine-h));
}

/* ------------------------------------------------------------- couverture */

/* Largeur FIXE egale a la largeur ouverte : la couverture ne s'etire donc pas
   pendant l'animation, c'est la rotation seule qu'on voit. */
.shelf-book__cover {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 9rem;
  overflow: hidden;
  transform-origin: left center;
  transform: rotateY(-90deg);
  opacity: 0;
  backface-visibility: hidden;
  transition:
    transform 0.45s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.2s ease;
}

.shelf-book.is-open .shelf-book__cover {
  transform: rotateY(0deg);
  opacity: 1;
}

.shelf-book__info {
  position: absolute;
  inset-inline: 0;
  bottom: 0;
  padding: 0.6rem 0.7rem;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.9),
    rgba(0, 0, 0, 0.55) 60%,
    transparent
  );
}

.shelf-book__inner:focus-visible .shelf-book__cover {
  outline: 2px solid var(--ui-primary);
  outline-offset: 2px;
}

/* -------------------------------------------------------------------- dark */

/* Vue scope le dernier compose du selecteur : .dark reste donc globable
   sans :global(), que Tailwind supprime car ce n'est pas du CSS valide. */
.dark .shelf-book__spine {
  background: oklch(0.30 0.04 var(--spine-h));
  border-color: oklch(0.38 0.04 var(--spine-h));
}

.dark .shelf-book__label {
  color: oklch(0.88 0.02 var(--spine-h));
}

.dark .shelf-book__mark {
  color: oklch(0.72 0.03 var(--spine-h));
}

@media (prefers-reduced-motion: reduce) {
  .shelf-book,
  .shelf-book__cover {
    transition-duration: 0.01ms;
  }
}
</style>
