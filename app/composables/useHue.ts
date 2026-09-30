/**
 * Teinte deterministe derivee d'une chaine (chemin de page, titre...).
 * Deux pages differentes ne se ressemblent jamais, et la meme page
 * garde toujours la meme identite visuelle entre deux builds.
 */
export function useHue(seed: string) {
  let hash = 0

  for (const char of seed) {
    hash = (hash * 31 + char.charCodeAt(0)) % 360
  }

  return {
    h1: String(hash),
    h2: String((hash + 55) % 360),
    h3: String((hash + 120) % 360)
  }
}
