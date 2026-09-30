/**
 * Resolveur de couvertures — DEV UNIQUEMENT.
 *
 * Sert a trouver l'URL d'une couverture a coller dans le frontmatter.
 * On resout une fois a la main plutot que de fetcher au runtime : pas de cle
 * exposee au navigateur, pas de rate limit a chaque visite, pas de page qui
 * casse si une API tombe.
 *
 *   /api/cover?kind=manga&q=Berserk
 *   /api/cover?kind=manga&q=Berserk&volume=13
 *   /api/cover?kind=book&q=Dune
 *   /api/cover?kind=series&q=Mr. Robot
 *   /api/cover?kind=music&q=In Rainbows
 *   /api/cover?kind=film&q=Blade Runner 2049
 */
export default defineEventHandler(async (event) => {
  // Sans ce garde-fou, la route serait un proxy ouvert en production.
  if (!import.meta.dev) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }

  const { kind, q, volume } = getQuery(event) as {
    kind?: string
    q?: string
    volume?: string
  }

  if (!kind || !q) {
    throw createError({ statusCode: 400, statusMessage: 'Parametres requis : kind et q' })
  }

  // Tome demande. Absent = pas de tome explicite, on retombe sur le visuel
  // de la serie (tome 1 par defaut). Present, meme a 1, = on veut CE tome.
  const requestedVolume = volume ? Number(volume) : null

  switch (kind) {
    case 'manga':
    case 'book': {
      // Open Library indexe les tomes individuellement ("Berserk Vol. 13"
      // renvoie sa propre couverture), y compris le tome 1.
      if (requestedVolume !== null) {
        const ol = await $fetch<any>('https://openlibrary.org/search.json', {
          query: { q: `${q} Vol. ${requestedVolume}`, limit: 1, fields: 'title,cover_i' }
        })
        const doc = ol?.docs?.[0]

        if (doc?.cover_i) {
          return {
            source: 'openlibrary',
            title: doc.title,
            cover: `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
          }
        }
      }

      // Manga (tome 1 ou tome introuvable) : Kitsu donne le visuel de la serie.
      if (kind === 'manga') {
        const res = await $fetch<any>('https://kitsu.io/api/edge/manga', {
          headers: { Accept: 'application/vnd.api+json' },
          query: { 'filter[text]': q, 'page[limit]': 1 }
        })
        const attrs = res?.data?.[0]?.attributes

        return {
          source: 'kitsu',
          title: attrs?.canonicalTitle,
          cover: attrs?.posterImage?.large ?? null
        }
      }

      const ol = await $fetch<any>('https://openlibrary.org/search.json', {
        query: { q, limit: 1, fields: 'title,cover_i' }
      })
      const doc = ol?.docs?.[0]

      return {
        source: 'openlibrary',
        title: doc?.title,
        cover: doc?.cover_i
          ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
          : null
      }
    }

    case 'series': {
      const res = await $fetch<any>('https://api.tvmaze.com/singlesearch/shows', {
        query: { q }
      })

      return {
        source: 'tvmaze',
        title: res?.name,
        cover: res?.image?.medium ?? res?.image?.original ?? null
      }
    }

    case 'music': {
      const res = await $fetch<any>('https://itunes.apple.com/search', {
        query: { term: q, entity: 'album', limit: 1 }
      })
      const hit = res?.results?.[0]

      return {
        source: 'itunes',
        title: hit?.collectionName,
        // artworkUrl100 est la seule taille garantie : on remonte a 600px.
        cover: hit?.artworkUrl100?.replace('100x100bb', '600x600bb') ?? null
      }
    }

    case 'film': {
      const apiKey = useRuntimeConfig().tmdbApiKey

      if (!apiKey) {
        throw createError({
          statusCode: 400,
          statusMessage: 'NUXT_TMDB_API_KEY manquant dans .env'
        })
      }

      const res = await $fetch<any>('https://api.themoviedb.org/3/search/movie', {
        query: {
          api_key: apiKey,
          query: q,
          language: 'en-US',
          page: 1,
          include_adult: false
        }
      })
      const hit = res?.results?.[0]

      return {
        source: 'tmdb',
        title: hit?.title,
        cover: hit?.poster_path
          ? `https://image.tmdb.org/t/p/w500${hit.poster_path}`
          : null
      }
    }

    default:
      throw createError({
        statusCode: 400,
        statusMessage: `Type inconnu : ${kind}. Attendu : manga, book, series, music, film`
      })
  }
})
