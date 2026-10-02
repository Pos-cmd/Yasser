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
    '@nuxtjs/color-mode',
    '@nuxtjs/i18n',
    'nuxt-studio'
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
  // Bilingue avec un prefixe explicite sur TOUTES les URLs, y compris la
  // langue par defaut : /fr/... et /en/....
  i18n: {
    baseUrl: 'https://yas.xyz',
    defaultLocale: 'fr',
    strategy: 'prefix',
    locales: [
      // `language` alimente `<html lang>` ET la valeur des `hreflang` : il est
      // obligatoire, sinon aucune balise `alternate` n'est produite. On le
      // laisse egal au code (et non `fr-FR`) : le contenu n'est pas specifique
      // a un pays, et une valeur differente ferait emettre DEUX alternates par
      // langue (`fr` en plus de `fr-FR`) vers la meme URL.
      { code: 'fr', language: 'fr', name: 'Français', file: 'fr.json' },
      { code: 'en', language: 'en', name: 'English', file: 'en.json' }
    ],
    // On ne devine pas la langue du visiteur : la racine doit toujours mener a
    // la version francaise, le choix se fait ensuite via le selecteur.
    detectBrowserLanguage: false
  },
  // Sans cette regle, « / » n'est la route d'aucune locale en strategie
  // `prefix` (les routes sont `/fr` et `/en`) et renverrait un 404.
  routeRules: {
    '/': { redirect: { to: '/fr', statusCode: 302 } }
  },
  // nuxt-studio exige owner/repo pour un build de production (sinon le module
  // jette « Repository owner and repository name are required »).
  studio: {
    repository: {
      provider: 'github',
      owner: 'Pos-cmd',
      repo: 'Yasser',
      branch: 'main'
    }
  },
  // @nuxtjs/seo : sans ces valeurs, le gabarit de titre rend un « %siteName »
  // litteral dans l'onglet. `url` sert aussi de base aux URLs canoniques.
  site: {
    url: 'https://yas.xyz',
    name: 'yas.xyz',
    description: 'Full-stack developer based in Lomé, Togo, building web applications with Vue, Nuxt, Laravel and TypeScript.',
    defaultLocale: 'fr',
    indexable: true
  },
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
