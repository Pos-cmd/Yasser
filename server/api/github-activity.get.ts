/**
 * Activite GitHub affichee dans la sidebar.
 *
 * Le damier de contributions n'existe pas dans l'API REST : il faut passer par
 * GraphQL, et donc par un jeton (NUXT_GITHUB_TOKEN, voir .env.example).
 *
 * Deux garde-fous volontaires :
 *   - sans jeton, la route renvoie `null` : le dev et le build fonctionnent
 *     sans secret, et le composant retombe sur sa carte d'attente ;
 *   - toute erreur remonte en `null` + avertissement serveur, jamais un 500.
 *
 * Le widget est present sur toutes les pages : le resultat est mis en cache
 * cote Nitro, sinon chaque visite couterait un appel a GitHub.
 */

const GRAPHQL_ENDPOINT = 'https://api.github.com/graphql'

// Le damier n'affiche que les dernieres semaines : assez large pour raconter
// quelque chose, assez lisible dans une sidebar de 19rem. Le total et les
// series portent eux sur l'annee complete.
const VISIBLE_WEEKS = 26

const WEEK_DAYS = 7

const CACHE_SECONDS = 60 * 60 * 6

const QUERY = `query ($login: String!) {
  user(login: $login) {
    repositories(privacy: PUBLIC, ownerAffiliations: OWNER, isFork: false) {
      totalCount
    }
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
            weekday
          }
        }
      }
    }
  }
}`

interface ContributionDay {
  date: string
  contributionCount: number
  weekday: number
}

interface GraphqlResponse {
  data?: {
    user?: {
      repositories?: { totalCount?: number }
      contributionsCollection?: {
        contributionCalendar?: {
          totalContributions?: number
          weeks?: { contributionDays?: ContributionDay[] }[]
        }
      }
    }
  }
  errors?: { message?: string }[]
}

interface GithubActivity {
  total: number
  publicRepos: number
  currentStreak: number
  longestStreak: number
  /**
   * Une entree par semaine, sept cases indexees par jour (0 = dimanche).
   * `null` marque une case hors calendrier, en debut et en fin d'annee.
   */
  weeks: (number | null)[][]
}

/** Series de jours consecutifs comptant au moins une contribution. */
function computeStreaks(days: ContributionDay[]) {
  let longest = 0
  let run = 0

  for (const day of days) {
    if (day.contributionCount > 0) {
      run += 1
      longest = Math.max(longest, run)
    }
    else {
      run = 0
    }
  }

  // Serie en cours : on remonte depuis la fin. Un dernier jour a 0 ne casse pas
  // la serie, la journee n'est simplement pas terminee.
  let current = 0
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i] && days[i].contributionCount > 0) {
      current += 1
    }
    else if (i < days.length - 1) {
      break
    }
  }

  return { current, longest }
}

/** Aligne les semaines sur une grille de sept lignes, prete a afficher. */
function toGrid(weeks: { contributionDays?: ContributionDay[] }[]) {
  return weeks.slice(-VISIBLE_WEEKS).map((week) => {
    const column: (number | null)[] = Array.from({ length: WEEK_DAYS }, () => null)

    for (const day of week.contributionDays ?? []) {
      column[day.weekday] = day.contributionCount
    }

    return column
  })
}

export default cachedEventHandler(async (): Promise<GithubActivity | null> => {
  const { githubToken, public: publicConfig } = useRuntimeConfig()
  const login = publicConfig.githubUser

  if (!githubToken) {
    console.warn('[github-activity] NUXT_GITHUB_TOKEN absent : widget laisse en attente.')
    return null
  }

  try {
    const response = await $fetch<GraphqlResponse>(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${githubToken}`,
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'yas.xyz'
      },
      body: { query: QUERY, variables: { login } }
    })

    if (response.errors?.length) {
      throw new Error(response.errors.map(error => error.message).join(' ; '))
    }

    const user = response.data?.user

    if (!user) {
      throw new Error(`Utilisateur GitHub introuvable : ${login}`)
    }

    const calendar = user.contributionsCollection?.contributionCalendar
    const weeks = calendar?.weeks ?? []
    const { current, longest } = computeStreaks(weeks.flatMap(week => week.contributionDays ?? []))

    return {
      total: calendar?.totalContributions ?? 0,
      publicRepos: user.repositories?.totalCount ?? 0,
      currentStreak: current,
      longestStreak: longest,
      weeks: toGrid(weeks)
    }
  }
  catch (error) {
    console.warn(`[github-activity] ${error instanceof Error ? error.message : String(error)}`)
    return null
  }
}, {
  // En dev, cache quasi nul : ajouter ou corriger le jeton se voit tout de suite.
  maxAge: import.meta.dev ? 1 : CACHE_SECONDS,
  swr: !import.meta.dev,
  // La reponse ne depend pas de la requete : une seule entree de cache.
  getKey: () => 'github-activity'
})
