/**
 * Noms de mois abreges, par langue.
 *
 * Ecrits ici plutot que lus avec `tm('months')` : `tm` renvoie les messages
 * tels que vue-i18n les a prepares, et sur le client les entrees reviennent
 * sous forme d'objets. Injecter un objet dans une interpolation
 * (`t('date.full', { month })`) leve alors « Cannot convert object to
 * primitive value » ; comme le serveur rendait bien le texte, cela produisait
 * en plus un mismatch d'hydratation.
 *
 * L'interpolation elle-meme n'est pas en cause : passer une chaine
 * (`t('projects.previewAlt', { title })`) fonctionne parfaitement.
 */
const MONTHS: Record<string, string[]> = {
  fr: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
}

/**
 * Formatage des dates fait main plutot qu'avec `toLocaleDateString` : le rendu
 * serveur et le rendu client doivent produire exactement la meme chaine, sinon
 * hydration mismatch. L'ordre des parties, lui, reste dans les fichiers de
 * locale (`date.monthYear`, `date.full`).
 */
export function useDateFormat() {
  const { t, locale } = useI18n()

  function monthOf(value: Date | string) {
    return MONTHS[locale.value]?.[new Date(value).getUTCMonth()] ?? ''
  }

  /** « août 2025 » / « Aug 2025 » — `null` donne la mention « aujourd'hui ». */
  function monthYear(value?: Date | string | null) {
    if (!value) return t('date.present')

    const date = new Date(value)

    return t('date.monthYear', { month: monthOf(value), year: date.getUTCFullYear() })
  }

  /** « 14 août 2025 » / « Aug 14, 2025 » */
  function fullDate(value: Date | string) {
    const date = new Date(value)

    return t('date.full', {
      month: monthOf(value),
      day: date.getUTCDate(),
      year: date.getUTCFullYear()
    })
  }

  return { monthYear, fullDate }
}
