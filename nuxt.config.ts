// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  modules: [
    '@nuxt/content',
    '@nuxt/fonts',
    '@nuxt/hints',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxtjs/seo',
    '@nuxt/ui',
    '@nuxtjs/color-mode'
  ],
  vite: {
    plugins: [
      tailwindcss(),
    ]
  },
  // Les polices sont téléchargées au build puis auto-hébergées par @nuxt/fonts :
  // aucun appel à fonts.googleapis.com au runtime (perf + RGPD).
  fonts: {
    defaults: {
      formats: ['woff2']
    },
    families: [
      {
        name: 'Plus Jakarta Sans',
        provider: 'google',
        // 400/500/600/700/800 couvrent font-normal, medium, semibold, bold, extrabold :
        // sans ces graisses réelles, le navigateur synthétiserait du faux gras.
        weights: [400, 500, 600, 700, 800],
        subsets: ['latin', 'latin-ext'],
        // Pas de `preload: true` volontairement : les @font-face sont découpés par
        // unicode-range (latin + latin-ext), et un preload téléchargerait TOUS les
        // sous-ensembles, y compris latin-ext qui n'est presque jamais utilisé.
        // Le défaut de @nuxt/fonts (pas de preload quand la police est subsettée)
        // évite ce gaspillage ; font-display: swap + fallback à métriques ajustées
        // (Fontaine) rendent l'attente de la police quasi invisible.
        global: true
      },
      {
        name: 'Instrument Serif',
        provider: 'google',
        weights: [400],
        subsets: ['latin', 'latin-ext'],
        global: true
      },
      {
        name: 'JetBrains Mono',
        provider: 'google',
        weights: [400, 500, 700],
        subsets: ['latin'],
        global: true
      }
    ]
  },
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  // Alimente par NUXT_TMDB_API_KEY dans .env (jamais commite).
  // Sert uniquement au resolveur de couvertures cote serveur.
  runtimeConfig: {
    tmdbApiKey: ''
  },
  compatibilityDate: '2024-04-03',
  ui: {
    theme: {
      defaultVariants: {
        color: 'neutral',
        size: 'sm'
      }
    },
    colorMode: false
  }
})
