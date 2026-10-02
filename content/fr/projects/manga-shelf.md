---
title: Manga Shelf
description: Une petite app pour suivre ce que je lis, née parce que tous les trackers existants voulaient d'abord un compte.
year: 2024
stack:
  - Nuxt
  - SQLite
  - Drizzle
  - Tailwind CSS
featured: true
order: 1
---

# Manga Shelf

Je lis beaucoup de mangas et je perdais sans arrêt le fil : quels tomes je possédais, où j'en étais. Chaque tracker que j'essayais voulait un compte, un abonnement, ou les deux. J'ai donc construit la version que je voulais : locale, hors ligne et rapide.

## Ce que ça fait

- Suit les séries, les tomes et la progression de lecture.
- Fonctionne entièrement hors ligne — les données vivent dans un seul fichier SQLite que tu peux déplacer.
- Importe depuis une simple liste texte, parce que saisir 200 tomes à la main n'est pas un trait de caractère.

## Ce que je ferais différemment

J'ai commencé par le schéma de base de données et traité l'interface comme une réflexion après coup. Si je le refaisais, j'esquisserais d'abord l'écran de lecture — le modèle de données s'est révélé être la partie facile.

[← Tous les projets](/fr/projects)
