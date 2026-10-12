---
title: JobProfils
description: Une plateforme de recrutement où les soft skills observés en entretien deviennent visibles sur le profil du candidat.
year: 2025
stack:
  - Laravel
  - Nuxt
  - PostgreSQL
  - Tailwind CSS
url: "https://jobprofils.com"
cover: "/projects/jobprofils/01-accueil.jpg"
featured: true
order: 1
---

# [JobProfils](https://jobprofils.com)

Un entretien dit beaucoup plus qu'un CV : la façon dont quelqu'un explique, écoute, nuance. Rien de tout cela ne survit à la fin de l'échange, et le candidat suivant repart de zéro. JobProfils permet aux recruteurs de consigner les soft skills qu'ils ont observés pendant l'entretien, puis les restitue sur le profil du candidat — constatés en situation réelle plutôt que déclarés.

Je mène le développement du produit, de l'architecture jusqu'à la coordination de l'équipe.

## Ce que ça fait

- Le recruteur renseigne les points forts et les axes d'amélioration observés, sur une grille structurée : dix soft skills minimum par entretien, quatre niveaux de poste.
- Les points forts apparaissent sur le profil du candidat, visibles des recruteurs de la plateforme. Les axes d'amélioration restent privés, jusqu'à ce que le candidat choisisse de les partager avec un coach.
- Trois espaces distincts cohabitent : candidats, recruteurs et coachs.

![Les trois publics de la plateforme](/projects/jobprofils/05-rejoindre.jpg)

## Comment c'est construit

![Le parcours candidat en trois étapes](/projects/jobprofils/02-comment-ca-marche.jpg)

Un monorepo, quatre applications : le site vitrine, l'espace candidat, le back-office et l'API. Laravel et PostgreSQL côté serveur, Nuxt côté navigateur.

![Ce que chaque public y gagne](/projects/jobprofils/03-avantages.jpg)

![Un profil enrichi par les retours d'entretien](/projects/jobprofils/04-profil-exemple.jpg)

## Ce que j'en retire

Presque toutes les décisions d'interface finissaient par découler d'une seule règle : un point fort est public, un axe d'amélioration ne l'est pas. La poser correctement dans le modèle de domaine nous a évité de la rediscuter écran par écran.

[← Tous les projets](/fr/projects)
