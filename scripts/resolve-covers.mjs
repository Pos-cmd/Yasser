/**
 * Resout les couvertures du shelf et les ecrit dans content/shelf.md.
 *
 *   node scripts/resolve-covers.mjs          # ne remplit que les manquantes
 *   node scripts/resolve-covers.mjs --force  # re-resout tout
 *
 * Le script patche le fichier ligne a ligne (il n'ecrit que des lignes
 * `cover:`) plutot que de re-serialiser le YAML : pas de reformatage
 * sauvage du frontmatter, pas de dependance a un parseur.
 */
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const SHELF = join(root, 'content', 'shelf.md')
const force = process.argv.includes('--force')

// ---------------------------------------------------------------- env

async function loadEnv() {
  if (process.env.NUXT_TMDB_API_KEY) return

  try {
    const raw = await readFile(join(root, '.env'), 'utf8')
    for (const line of raw.split('\n')) {
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/)
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2].trim()
      }
    }
  } catch {
    // pas de .env, on continue : seuls les films en ont besoin.
  }
}

// ---------------------------------------------------------------- api

async function getJson(url, headers = {}) {
  const res = await fetch(url, { headers })

  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText} — ${url}`)
  }

  return res.json()
}

async function resolveCover(kind, title, volume = null) {
  switch (kind) {
    case 'manga': {
      // Tome explicite : Open Library indexe les tomes individuellement,
      // y compris le tome 1.
      if (volume !== null) {
        const query = encodeURIComponent(`${title} Vol. ${volume}`)
        const ol = await getJson(
          `https://openlibrary.org/search.json?q=${query}&limit=1&fields=title,cover_i`
        )
        const coverId = ol?.docs?.[0]?.cover_i

        if (coverId) {
          return `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
        }
      }

      // Tome 1 (ou tome introuvable) : Kitsu donne le visuel de la serie.
      const res = await getJson(
        `https://kitsu.io/api/edge/manga?filter%5Btext%5D=${encodeURIComponent(title)}&page%5Blimit%5D=1`,
        { Accept: 'application/vnd.api+json' }
      )

      return res?.data?.[0]?.attributes?.posterImage?.large ?? null
    }

    case 'book': {
      const ol = await getJson(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(title)}&limit=1&fields=title,cover_i`
      )
      const coverId = ol?.docs?.[0]?.cover_i

      return coverId
        ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
        : null
    }

    case 'series': {
      const res = await getJson(
        `https://api.tvmaze.com/singlesearch/shows?q=${encodeURIComponent(title)}`
      )

      return res?.image?.medium ?? res?.image?.original ?? null
    }

    case 'music': {
      const res = await getJson(
        `https://itunes.apple.com/search?term=${encodeURIComponent(title)}&entity=album&limit=1`
      )
      const artwork = res?.results?.[0]?.artworkUrl100

      // artworkUrl100 est la seule taille garantie : on remonte a 600px.
      return artwork ? artwork.replace('100x100bb', '600x600bb') : null
    }

    case 'film': {
      // Lu ici et non au chargement du module : loadEnv() tourne apres
      // l'evaluation des constantes de haut niveau.
      const apiKey = process.env.NUXT_TMDB_API_KEY

      if (!apiKey) {
        throw new Error('NUXT_TMDB_API_KEY absent de .env')
      }

      const res = await getJson(
        `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}` +
        `&query=${encodeURIComponent(title)}&language=en-US&page=1&include_adult=false`
      )
      const poster = res?.results?.[0]?.poster_path

      return poster ? `https://image.tmdb.org/t/p/w500${poster}` : null
    }

    default:
      throw new Error(`Type inconnu : ${kind}`)
  }
}

// ---------------------------------------------------------------- parse

const raw = await readFile(SHELF, 'utf8')
const lines = raw.split('\n')

/** Une entree commence par "  - title: X" ; elle court jusqu'a la suivante. */
function findEntries() {
  const found = []

  for (let i = 0; i < lines.length; i++) {
    const head = lines[i].match(/^(\s*)- title:\s*(.+?)\s*$/)
    if (!head) continue

    const indent = head[1]
    let end = i
    let kind = null
    let volume = null

    for (let j = i + 1; j < lines.length; j++) {
      // Un YAML de premier niveau (---, now:, items:) ferme l'entree.
      if (/^\S/.test(lines[j])) break
      if (/^\s*- title:/.test(lines[j])) break

      const kindMatch = lines[j].match(/^\s+kind:\s*(\S+)/)
      if (kindMatch) kind = kindMatch[1]

      const volumeMatch = lines[j].match(/^\s+volume:\s*(\d+)/)
      if (volumeMatch) volume = Number(volumeMatch[1])

      end = j
    }

    found.push({ title: head[2], kind, volume, indent, start: i, end })
  }

  return found
}

// ---------------------------------------------------------------- run

await loadEnv()

const entries = findEntries()
const patches = []

console.log(`\n${entries.length} entrees trouvees dans content/shelf.md\n`)

for (const entry of entries) {
  // Index absolu d'une ligne `cover:` deja presente pour cette entree.
  let coverIndex = -1
  for (let i = entry.start + 1; i <= entry.end; i++) {
    if (/^\s+cover:/.test(lines[i])) {
      coverIndex = i
      break
    }
  }

  if (coverIndex > -1 && !force) {
    console.log(`  = ${entry.title} — deja une couverture`)
    continue
  }

  if (!entry.kind) {
    console.log(`  ! ${entry.title} — pas de champ kind, ignore`)
    continue
  }

  try {
    const cover = await resolveCover(entry.kind, entry.title, entry.volume)

    if (!cover) {
      console.log(`  x ${entry.title} — aucune couverture trouvee`)
      continue
    }

    const text = `${entry.indent}  cover: "${cover}"`

    if (coverIndex > -1) {
      patches.push({ type: 'replace', index: coverIndex, text })
    }
    else {
      let kindIndex = -1
      for (let i = entry.start + 1; i <= entry.end; i++) {
        if (/^\s+kind:/.test(lines[i])) {
          kindIndex = i
          break
        }
      }

      patches.push({
        type: 'insert',
        index: (kindIndex > -1 ? kindIndex : entry.start) + 1,
        text
      })
    }

    console.log(`  + ${entry.title} (${entry.kind}${entry.volume ? ` vol. ${entry.volume}` : ''})`)
  }
  catch (error) {
    console.log(`  x ${entry.title} — ${error.message}`)
  }

  // Petite pause pour ne pas se faire rate-limiter par Kitsu / Open Library.
  await new Promise(done => setTimeout(done, 400))
}

// Ordre inverse : les index des patchs suivants restent valides.
for (const patch of patches.sort((a, b) => b.index - a.index)) {
  if (patch.type === 'replace') {
    lines[patch.index] = patch.text
  }
  else {
    lines.splice(patch.index, 0, patch.text)
  }
}

await writeFile(SHELF, lines.join('\n'), 'utf8')

console.log(`\n${patches.length} couverture(s) ecrite(s) dans content/shelf.md\n`)
