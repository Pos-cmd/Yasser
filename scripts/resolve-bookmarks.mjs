/**
 * Resout les apercus des liens de content/bookmarks.md.
 *
 *   node scripts/resolve-bookmarks.mjs          # ne traite que les liens sans titre
 *   node scripts/resolve-bookmarks.mjs --force  # re-resout tout
 *
 * Strategie :
 *   1. parseur Open Graph maison (aucune dependance, aucune limite d'appels)
 *   2. repli sur l'API microlink si le parseur ne trouve rien
 *
 * Le script patche le fichier ligne a ligne (il n'ecrit que des lignes de
 * metadonnees) plutot que de re-serialiser le YAML : ton frontmatter et tes
 * commentaires restent intacts.
 */
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const FILE = join(root, 'content', 'bookmarks.md')
const force = process.argv.includes('--force')

// Les cles qu'on ecrit, dans l'ordre d'affichage dans le fichier.
const KEYS = ['title', 'description', 'image', 'site']

const UA = 'Mozilla/5.0 (compatible; yas.xyz-link-preview/1.0)'

// ---------------------------------------------------------------- parsing

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' }

function decode(value) {
  if (!value) return value

  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&([a-z]+);/gi, (match, name) => ENTITIES[name] ?? match)
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Cherche une balise <meta> par property/name, puis extrait son content
 * DANS la balise trouvee. C'est ce qui rend la recherche insensible a
 * l'ordre des attributs : <meta property=... content=...> et
 * <meta content=... property=...> sont tous les deux geres.
 */
function meta(html, key) {
  const tag = html.match(
    new RegExp(`<meta[^>]*(?:property|name)=["']${key}["'][^>]*>`, 'i')
  )?.[0]

  return tag ? decode(tag.match(/content=["']([^"']*)["']/i)?.[1]) : null
}

function pageTitle(html) {
  return decode(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1])
}

function anchor(url, base) {
  try {
    return new URL(url, base).href
  }
  catch {
    return null
  }
}

// ------------------------------------------------------------------ fetch

/**
 * Suit les redirections HTTP *et* les redirections HTML
 * (<meta http-equiv="refresh">).
 *
 * Ce n'est pas theorique : nuxt.com/docs/getting-started/introduction renvoie
 * 124 octets contenant uniquement un meta refresh. Un parseur qui ne suit que
 * les 3xx ne trouve rien sur cette page et croit le site depourvu d'Open Graph.
 */
async function fetchHtml(url, depth = 0) {
  const response = await fetch(url, {
    redirect: 'follow',
    headers: {
      'user-agent': UA,
      'accept': 'text/html,application/xhtml+xml',
      'accept-language': 'en'
    },
    signal: AbortSignal.timeout(15000)
  })

  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.includes('html')) return { html: '', url: response.url || url }

  const html = await response.text()
  const finalUrl = response.url || url

  const refresh = html.match(
    /<meta[^>]*http-equiv=["']?refresh["']?[^>]*content=["'][^"']*url=([^"';\s>]+)/i
  )?.[1]

  if (refresh && depth < 3) {
    const next = anchor(decode(refresh), finalUrl)

    if (next && next !== finalUrl) return fetchHtml(next, depth + 1)
  }

  return { html, url: finalUrl }
}

/** 1. Parseur maison. */
async function fromOpenGraph(url) {
  const { html, url: finalUrl } = await fetchHtml(url)

  if (!html) return null

  const title = meta(html, 'og:title') ?? pageTitle(html)
  if (!title) return null

  const rawImage = meta(html, 'og:image') ?? meta(html, 'twitter:image')

  return {
    title,
    description:
      meta(html, 'og:description')
      ?? meta(html, 'twitter:description')
      ?? meta(html, 'description'),
    image: rawImage ? anchor(rawImage, finalUrl) : null,
    site: meta(html, 'og:site_name') ?? new URL(finalUrl).hostname.replace(/^www\./, ''),
    source: 'opengraph'
  }
}

/** 2. Repli microlink : sans cle, il gere les SPA et les rendus JS. */
async function fromMicrolink(url) {
  const response = await fetch(
    `https://api.microlink.io/?url=${encodeURIComponent(url)}`,
    { signal: AbortSignal.timeout(25000) }
  )
  const json = await response.json()

  if (json?.status !== 'success' || !json.data?.title) return null

  return {
    title: json.data.title,
    description: json.data.description ?? null,
    image: json.data.image?.url ?? null,
    site: json.data.publisher ?? null,
    source: 'microlink'
  }
}

/**
 * Verifie que l'URL pointe vraiment vers une image.
 *
 * Indispensable en pratique : regex101 annonce og:image = "/preview/", qui est
 * une page HTML. Sans ce filtre on stocke une URL qui affichera une vignette
 * cassee.
 */
async function isImage(url) {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      headers: { 'user-agent': UA },
      signal: AbortSignal.timeout(8000)
    })

    const type = response.headers.get('content-type') ?? ''
    if (!type) return true

    return type.startsWith('image/')
  }
  catch {
    // Serveur qui refuse HEAD : on ne jette pas une image potentiellement valide.
    return true
  }
}

async function resolve(url) {
  try {
    const og = await fromOpenGraph(url)
    if (og) return og
  }
  catch {
    // on bascule sur le repli
  }

  try {
    return await fromMicrolink(url)
  }
  catch {
    return null
  }
}

// ------------------------------------------------------------------- yaml

const yamlString = (value) =>
  `"${String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`

const raw = await readFile(FILE, 'utf8')
const lines = raw.split('\n')

/**
 * Une entree de lien = "- label: X" suivi d'un "url:". Les en-tetes de groupe
 * ("- label: Documentation") matchent aussi le motif, mais n'ont pas d'url :
 * ils sont donc ecartes naturellement.
 */
function findEntries() {
  const found = []

  for (let i = 0; i < lines.length; i++) {
    const head = lines[i].match(/^(\s*)- label:\s*(.+?)\s*$/)
    if (!head) continue

    const indent = head[1]
    let end = i
    let url = null
    let urlIndex = -1

    for (let j = i + 1; j < lines.length; j++) {
      if (/^\S/.test(lines[j])) break
      if (/^\s*- label:/.test(lines[j])) break

      const urlMatch = lines[j].match(/^\s+url:\s*(.+?)\s*$/)
      if (urlMatch) {
        url = urlMatch[1].replace(/^["']|["']$/g, '')
        urlIndex = j
      }

      end = j
    }

    if (url && urlIndex > -1) {
      found.push({ label: head[2], url, indent, end, urlIndex })
    }
  }

  return found
}

// -------------------------------------------------------------------- run

const entries = findEntries()
const patches = []

console.log(`\n${entries.length} liens trouves dans content/bookmarks.md\n`)

for (const entry of entries) {
  const already = lines
    .slice(entry.urlIndex + 1, entry.end + 1)
    .some(line => /^\s+title:/.test(line))

  if (already && !force) {
    console.log(`  = ${entry.label} — deja resolu`)
    continue
  }

  const data = await resolve(entry.url)

  if (!data) {
    console.log(`  x ${entry.label} — rien trouve`)
    continue
  }

  const values = {
    title: data.title?.slice(0, 120),
    // Les descriptions trop courtes ("Nuxt", "Home") n'apportent rien.
    description: data.description?.length > 15 ? data.description.slice(0, 220) : null,
    image: data.image,
    site: data.site
  }

  if (values.image && !(await isImage(values.image))) {
    console.log(`    (image ecartee, ce n'est pas une image : ${values.image})`)
    values.image = null
  }

  const block = KEYS
    .filter(key => values[key])
    .map(key => `${entry.indent}  ${key}: ${yamlString(values[key])}`)
    .join('\n')

  // On supprime les anciennes valeurs de ces cles avant de reinserer.
  for (let i = entry.end; i > entry.urlIndex; i--) {
    if (KEYS.some(key => new RegExp(`^\\s+${key}:`).test(lines[i]))) {
      patches.push({ type: 'delete', index: i })
    }
  }

  patches.push({ type: 'insert', index: entry.urlIndex + 1, text: block })

  console.log(`  + ${entry.label} [${data.source}] ${String(data.title).slice(0, 52)}`)

  // On reste courtois avec les sites qu'on interroge.
  await new Promise(done => setTimeout(done, 300))
}

// Ordre decroissant : les index des patchs suivants restent valides.
for (const patch of patches.sort((a, b) => b.index - a.index)) {
  if (patch.type === 'delete') {
    lines.splice(patch.index, 1)
  }
  else {
    lines.splice(patch.index, 0, patch.text)
  }
}

await writeFile(FILE, lines.join('\n'), 'utf8')

console.log(`\n${patches.filter(p => p.type === 'insert').length} lien(s) enrichi(s)\n`)
