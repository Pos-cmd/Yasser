---
title: J'ai arrêté d'utiliser les barrel files
date: 2025-04-19
description: Un index.ts qui ré-exporte tout un dossier, ça avait l'air propre. Ça me coûtait discrètement du temps de build et de la clarté.
draft: false
tags:
  - TypeScript
  - Tooling
---

# J'ai arrêté d'utiliser les barrel files

Pendant longtemps, chaque dossier avait un `index.ts` qui ré-exportait tout ce qu'il contenait :

```ts
export * from './Button'
export * from './Input'
export * from './Modal'
```

Les imports avaient l'air propres et ça ressemblait à une bonne structure. Puis un projet a grossi et le même import a commencé à faire mal.

## Le problème

Un barrel file est un module qui importe tout, donc tout ce qui le touche tire tout le reste. Sur un projet, importer un simple utilitaire de formatage finissait par traîner tout le kit d'interface dans l'environnement de test. Les tests ralentissaient, et personne n'arrivait à comprendre pourquoi.

Le deuxième problème, c'est la circularité. Une fois que chaque dossier ré-exporte ses voisins, il est facile de créer un cycle que TypeScript tolère et que ton bundler ne tolère pas. L'erreur que tu finis par obtenir pointe ailleurs que la cause réelle.

## Ce que je fais à la place

J'importe depuis le fichier qui possède réellement la chose :

```ts
import { Button } from '~/components/Button.vue'
```

Un peu plus long à taper, beaucoup plus facile à tracer. L'auto-import de mon éditeur fait le travail de toute façon, et « d'où vient ce truc » a désormais une réponse évidente.

## La nuance

Les barrels ne sont pas malfaisants. Ils gagnent leur place à la frontière publique d'une librairie, là où tu veux délibérément cacher l'organisation interne des fichiers aux consommateurs. C'est un vrai besoin. L'erreur, c'était de le faire partout, par réflexe, pour faire propre.
