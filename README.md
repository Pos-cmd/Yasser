# yas.xyz

Site personnel bilingue (français / anglais), construit avec Nuxt 4, Nuxt Content, Nuxt UI et `@nuxtjs/i18n`.

## Contenu et langues

Toutes les URLs portent un préfixe de langue explicite — `/fr/...` et `/en/...` — et la racine `/` redirige vers `/fr`.

- Le contenu vit dans **deux dossiers parallèles** : `content/fr/` et `content/en/`. Le chemin d'une page est sa position dans `content/`, donc `content/fr/about.md` répond à `/fr/about`.
- **Créer une page, c'est la créer dans les deux dossiers.** Une page présente d'un seul côté n'existe que dans une langue.
- Les textes d'interface (navigation, titres de section, libellés de dates, fil d'Ariane) sont dans `i18n/locales/fr.json` et `i18n/locales/en.json`. Toute chaîne visible ajoutée dans un composant a besoin de sa clé dans les deux fichiers.
- Les liens internes passent par `useContentLocale().localeHref()` : `@nuxtjs/i18n` ne localise pas `NuxtLink` automatiquement, donc un `to="/about"` rendu tel quel renverrait un 404.
- `app/app.vue` branche `useLocaleHead()` sur `useHead` : c'est ce qui produit les `<link rel="alternate" hreflang>` et le `lang` de `<html>`. La propriété `language` de chaque locale est obligatoire (elle sert de valeur `hreflang`) et doit rester égale au `code`.
- `pnpm covers` et `pnpm bookmarks` écrivent dans les deux fichiers de locale ; les métadonnées ne sont résolues qu'une fois.

Check the [Nuxt Content documentation](https://content.nuxt.com) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
