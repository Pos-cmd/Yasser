<script setup lang="ts">
const route = useRoute()

const hues = computed(() => useHue(route.path))
</script>

<template>
  <div
    class="page-banner relative h-24 shrink-0 overflow-hidden border-b border-dashed border-default sm:h-32 lg:h-44"
    :style="{
      '--h1': hues.h1,
      '--h2': hues.h2,
      '--h3': hues.h3
    }"
  >
    <div class="page-banner__stripes" aria-hidden="true" />
  </div>
</template>

<style scoped>
.page-banner {
  background-image: linear-gradient(
    115deg,
    oklch(0.93 0.04 var(--h1)),
    oklch(0.97 0.03 var(--h2)),
    oklch(0.90 0.045 var(--h3)),
    oklch(0.93 0.04 var(--h1))
  );
  background-size: 300% 300%;
  animation: banner-drift 24s ease-in-out infinite alternate;
}

/* Meme trame diagonale que le fond du body : la banniere appartient au site
   au lieu de flotter au-dessus. */
.page-banner__stripes {
  position: absolute;
  inset: 0;
  background-image: repeating-linear-gradient(
    135deg,
    transparent 0 3px,
    rgba(0, 0, 0, 0.06) 3px 4px
  );
}

/* Vue scope le dernier compose du selecteur, donc .dark reste globable
   sans avoir besoin de :global() — que Tailwind supprime car invalide. */
.dark .page-banner {
  background-image: linear-gradient(
    115deg,
    oklch(0.26 0.04 var(--h1)),
    oklch(0.21 0.03 var(--h2)),
    oklch(0.30 0.045 var(--h3)),
    oklch(0.26 0.04 var(--h1))
  );
}

.dark .page-banner__stripes {
  background-image: repeating-linear-gradient(
    135deg,
    transparent 0 3px,
    rgba(255, 255, 255, 0.05) 3px 4px
  );
}

@keyframes banner-drift {
  from { background-position: 0% 50%; }
  to { background-position: 100% 50%; }
}

@media (prefers-reduced-motion: reduce) {
  .page-banner {
    animation: none;
  }
}
</style>
