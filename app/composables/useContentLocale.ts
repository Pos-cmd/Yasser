/**
 * Le contenu est duplique par langue dans `content/<locale>/...` : le chemin
 * d'une page de contenu reprend donc celui de l'URL (`/fr/about`).
 *
 * Ces helpers evitent de recalculer ce prefixe dans chaque page, et tolerent
 * les deux comportements possibles du routeur (avec ou sans prefixe de locale
 * dans `route.path` selon la strategie de routage).
 */
export function useContentLocale() {
  const { locale, locales } = useI18n()
  const route = useRoute()

  const codes = computed(() =>
    locales.value.map(entry => (typeof entry === 'string' ? entry : entry.code))
  )

  /** Prefixe de la locale active trouve dans le chemin courant, ex. `fr`. */
  const activePrefix = computed(() =>
    codes.value.find(code => route.path === `/${code}` || route.path.startsWith(`/${code}/`)) ?? null
  )

  /** `/fr/about` -> `/about`, `/fr` -> `/`. */
  const basePath = computed(() => {
    const prefix = activePrefix.value
    if (!prefix) return route.path

    return route.path.slice(prefix.length + 1) || '/'
  })

  /** `/about` -> `/fr/about`, `/` -> `/fr`. */
  const contentPath = computed(() =>
    basePath.value === '/' ? `/${locale.value}` : `/${locale.value}${basePath.value}`
  )

  /** Vrai si un chemin de contenu appartient a la locale active. */
  function inLocale(path: string) {
    return path === `/${locale.value}` || path.startsWith(`/${locale.value}/`)
  }

  /** Retire le prefixe de locale d'un chemin, s'il y en a un. */
  function stripLocale(path: string) {
    const prefix = codes.value.find(code => path === `/${code}` || path.startsWith(`/${code}/`))
    if (!prefix) return path

    return path.slice(prefix.length + 1) || '/'
  }

  /**
   * Chemin de navigation dans la locale active.
   *
   * `@nuxtjs/i18n` ne localise PAS `NuxtLink` automatiquement (contrairement
   * aux anciennes versions) : les liens doivent porter leur prefixe. Ce helper
   * accepte aussi bien un chemin neutre (`/about`) qu'un chemin de contenu deja
   * prefixe (`/fr/about`) et rend toujours `/fr/about` ou `/en/about`.
   */
  function localeHref(path: string) {
    const neutral = stripLocale(path)

    return neutral === '/' ? `/${locale.value}` : `/${locale.value}${neutral}`
  }

  return { basePath, contentPath, inLocale, localeHref }
}
