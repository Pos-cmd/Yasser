<script setup lang="ts">
/**
 * Avatar « mascotte » piloté par le curseur.
 *
 * Planche : `public/profile_mascot.png`, 9 poses en 3 × 3 sur fond
 * transparent, dans l'ordre de lecture :
 *
 *   0 1 2
 *   3 4 5
 *   6 7 8
 *
 * ⚠️ La planche n'est PAS une grille régulière de 1254 / 3 = 418 px :
 * les poses sont espacées de 408 px en X et 402 px en Y (et les têtes
 * sont alignées en haut). Le carré capable de contenir une pose sans
 * la couper fait donc 402 px de côté — et non 360.
 *
 * Toute la géométrie tient dans `GRID` ci-dessous : le cadrage d'une
 * pose se réduit à deux multiplications, sans table de recadrage.
 */

const props = withDefaults(
  defineProps<{
    /** Planche utilisée pour suivre le curseur. */
    src?: string

    /**
     * Planche optionnelle jouée pendant les réactions.
     * Elle doit partager la même grille 3 × 3 que `src`.
     */
    reactions?: string

    alt?: string

    /**
     * Résolution demandée au provider d'images (px).
     *
     * La planche native fait 1254 px de côté mais n'est affichée
     * qu'à ~3,1 × `--mascot-size` : inutile de payer 1 Mo de webp.
     */
    sourceWidth?: number
  }>(),
  {
    src: '/profile_mascot.png',
    alt: 'Portrait of Yasser',
    sourceWidth: 1080
  }
)

/**
 * Géométrie de la grille, en px planche :
 * - `x` / `y` : coin haut-gauche de la pose 0 ;
 * - `colStep` / `rowStep` : écart entre deux poses voisines.
 *
 * Valeurs mesurées sur `public/profile_mascot.png` (profils alpha).
 * À remesurer si la planche est regénérée. Le côté de la planche
 * (1254) et celui du carré de recadrage (402) sont déclarés en CSS,
 * dans `.mascot`.
 */
const GRID = {
  x: 20,
  y: 13,
  colStep: 408,
  rowStep: 402
}

/** Durée de la réaction au clic, en ms. */
const REACTION_MS = 420

const root = ref<HTMLElement | null>(null)

/** Pose affichée. */
const cell = ref({ row: 1, col: 1 })

/** `reacting` fige la pose le temps de la réaction. */
const state = ref<'tracking' | 'reacting'>('tracking')

/** Poses déjà jouées : les 9 réactions défilent sans se répéter. */
let bag: number[] = []

let reducedMotion = false

/** Planche affichée. */
const sheetSrc = computed(() =>
  state.value === 'reacting' && props.reactions
    ? props.reactions
    : props.src
)

/**
 * Coin haut-gauche du recadrage de la pose courante, en px planche.
 *
 * Le composant ne transmet que ces deux nombres : le CSS les convertit
 * en décalage en % de l'image, donc le cadrage reste juste quelle que
 * soit la taille d'affichage.
 */
const rootStyle = computed(() => ({
  '--mascot-x': String(cell.value.col * GRID.colStep + GRID.x),
  '--mascot-y': String(cell.value.row * GRID.rowStep + GRID.y)
}))

/**
 * Pose correspondant à un point de l'écran.
 *
 * Le seuil vaut 1/6 de la taille affichée : dès que le curseur sort de
 * la zone centrale, la mascotte regarde à gauche, à droite, en haut ou
 * en bas.
 */
function cellFromPoint(x: number, y: number, rect: DOMRect) {
  const reach = rect.width / 6

  const dx = x - (rect.left + rect.width / 2)
  const dy = y - (rect.top + rect.height / 2)

  return {
    row: dy > reach ? 2 : dy < -reach ? 0 : 1,
    col: dx > reach ? 2 : dx < -reach ? 0 : 1
  }
}

let handle = 0

let pointer: { x: number; y: number } | null = null

/** Applique le regard à la dernière position connue du curseur. */
function track() {
  handle = 0

  const element = root.value

  if (!element || !pointer || state.value === 'reacting') {
    return
  }

  const next = cellFromPoint(
    pointer.x,
    pointer.y,
    element.getBoundingClientRect()
  )

  if (
    next.row !== cell.value.row ||
    next.col !== cell.value.col
  ) {
    cell.value = next
  }
}

/**
 * Suivi du curseur.
 *
 * La lecture du layout est différée à la frame suivante : les
 * `pointermove` arrivent bien plus vite que 60 Hz.
 */
function onPointerMove(event: PointerEvent) {
  pointer = {
    x: event.clientX,
    y: event.clientY
  }

  // Toujours replanifier : si une frame ne part pas (onglet en
  // arrière-plan, page masquée), le suivi resterait bloqué pour de bon.
  if (handle) {
    cancelAnimationFrame(handle)
  }

  handle = requestAnimationFrame(track)
}

/** Retour à la pose de face. */
function faceFront() {
  pointer = null

  if (handle) {
    cancelAnimationFrame(handle)
    handle = 0
  }

  cell.value = {
    row: 1,
    col: 1
  }
}

/**
 * Vraie sortie de la fenêtre.
 *
 * Chromium émet des `pointerleave` sur `document` au moindre
 * changement d'élément survolé : seul `relatedTarget === null` signale
 * une sortie réelle.
 */
function onPointerLeave(event: PointerEvent) {
  if (event.relatedTarget) {
    return
  }

  faceFront()
}

/** Petit sursaut au clic. */
function jump() {
  if (reducedMotion) {
    return
  }

  root.value?.animate(
    [
      { transform: 'scale(1)' },
      { transform: 'scale(1.12)' },
      { transform: 'scale(1.04)' },
      { transform: 'scale(1)' }
    ],
    {
      duration: REACTION_MS,
      easing: 'ease-out'
    }
  )
}

let reactionTimer: ReturnType<typeof setTimeout> | undefined

/**
 * Réaction au clic : une pose piochée dans un sac de 9 (donc jamais
 * deux fois la même à la suite sur un cycle), puis retour au suivi.
 */
function react() {
  state.value = 'reacting'

  if (bag.length === 0) {
    bag = [0, 1, 2, 3, 4, 5, 6, 7, 8]
  }

  const index = bag.splice(
    Math.floor(Math.random() * bag.length),
    1
  )[0]!

  cell.value = {
    row: Math.floor(index / 3),
    col: index % 3
  }

  jump()

  clearTimeout(reactionTimer)

  reactionTimer = setTimeout(() => {
    state.value = 'tracking'

    if (pointer) {
      track()
    } else {
      cell.value = {
        row: 1,
        col: 1
      }
    }
  }, REACTION_MS)
}

onMounted(() => {
  reducedMotion = window
    .matchMedia('(prefers-reduced-motion: reduce)')
    .matches

  // Sur écran tactile, il n'y a pas de curseur à suivre.
  if (
    !window.matchMedia('(hover: hover) and (pointer: fine)').matches
  ) {
    return
  }

  window.addEventListener('pointermove', onPointerMove, {
    passive: true
  })

  window.addEventListener('blur', faceFront)

  document.addEventListener('pointerleave', onPointerLeave)
})

onBeforeUnmount(() => {
  if (handle) {
    cancelAnimationFrame(handle)
  }

  clearTimeout(reactionTimer)

  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('blur', faceFront)
  document.removeEventListener('pointerleave', onPointerLeave)
})
</script>

<template>
  <div
    ref="root"
    class="mascot"
    :style="rootStyle"
    @click="react"
  >
    <NuxtImg
      :src="sheetSrc"
      :alt="alt"
      :width="sourceWidth"
      :height="sourceWidth"
      format="webp"
      densities="1x"
      class="mascot__img"
    />
  </div>
</template>

<style scoped>
.mascot {
  /*
   * Géométrie de la planche, en px : côté de la planche et côté du
   * carré de recadrage d'une pose (cf. `GRID` dans le script).
   */
  --mascot-sheet: 1254;
  --mascot-crop: 402;

  /*
   * Taille d'affichage d'une pose.
   *
   * ⚠️ Ne PAS déclarer `--mascot-size` ici : la règle scopée
   * (spécificité 0,2,0) écraserait la valeur passée par le parent via
   * une classe utilitaire (0,1,0).
   */
  width: var(--mascot-size, var(--mascot-crop));
  height: var(--mascot-size, var(--mascot-crop));

  position: relative;
  overflow: hidden;

  user-select: none;
  cursor: pointer;

  image-rendering: pixelated;
}

/*
 * La planche est affichée en entier, puis décalée pour ne laisser voir
 * que la pose voulue.
 *
 * 1254 / 402 ≈ 3,12 → l'image fait ~312 % du cadre. Le décalage est
 * exprimé en % de l'image elle-même (`--mascot-x` / `--mascot-y` sont
 * en px planche, divisés par le côté de la planche) : aucune dimension
 * d'affichage à maintenir ici.
 *
 * Valeurs de repli = pose de face (408 + 20 / 402 + 13).
 */
.mascot__img {
  position: absolute;
  top: 0;
  left: 0;

  width: calc(var(--mascot-sheet) / var(--mascot-crop) * 100%);
  height: calc(var(--mascot-sheet) / var(--mascot-crop) * 100%);

  max-width: none;

  transform: translate(
    calc(var(--mascot-x, 428) * -100% / var(--mascot-sheet)),
    calc(var(--mascot-y, 415) * -100% / var(--mascot-sheet))
  );

  transition: none;

  image-rendering: pixelated;
}
</style>
