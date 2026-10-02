---
title: Structurer Nuxt Content en collections qui ont du sens
description: Découper une collection fourre-tout en quelques collections typées, et le piège de routage qui va avec.
date: 2025-08-14
tags:
  - Nuxt
  - Content
  - TypeScript
draft: false
---

# Structurer Nuxt Content en collections qui ont du sens

Le starter arrive avec une seule collection :

```ts
content: defineCollection({ type: 'page', source: '**' })
```

Ça va très bien jusqu'à ce que ça n'aille plus. Dès que tu veux une date `start` sur une expérience et un drapeau `draft` sur une note, une seule collection signifie un seul schéma pour les deux — donc chaque champ devient optionnel et tu perds le typage qui t'avait fait choisir Nuxt Content.

## Une collection par type de contenu

Le chemin d'un document, c'est sa position dans `content/`, pas le glob qui l'a attrapé. Donc `content/notes/hello.md` vaut `/notes/hello`, peu importe la collection qui le revendique. Découper est donc gratuit du point de vue du routage :

```ts
notes: defineCollection({
  type: 'page',
  source: 'notes/**/*.md',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    draft: z.boolean().default(false)
  })
})
```

Maintenant `date` est un vrai `Date` dans tes templates, et l'oublier devient une erreur de build plutôt qu'une page qui affiche `undefined`.

## Le piège

Une route fourre-tout qui fonctionnait cesse immédiatement de fonctionner :

```ts
queryCollection('content').path(route.path).first() // ne matche plus rien
```

Avec plusieurs collections de pages, il faut interroger chacune d'elles. Enchaîne-les avec `??` pour que les recherches court-circuitent au lieu de lancer quatre requêtes à chaque appel :

```ts
return (
  (await queryCollection('pages').path(path).first()) ??
  (await queryCollection('notes').path(path).first()) ??
  null
)
```

J'ai passé vingt minutes perplexes convaincu que le contenu avait disparu, avant de réaliser qu'il était là depuis le début, dans une collection que personne n'interrogeait.

## Quand une seule collection reste le bon choix

Si tout partage vraiment la même forme, reste simple. Le découpage gagne sa place dès que deux types de contenu ont besoin de champs obligatoires différents — avant ça, c'est de la cérémonie.
