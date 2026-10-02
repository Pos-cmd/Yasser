---
title: Les tokens de design dans Tailwind v4, sans fichier de config
description: Le bloc @theme a remplacé tailwind.config.js, et ça change ta façon de penser ton système de design.
date: 2025-06-02
tags:
  - Tailwind
  - CSS
  - Design
draft: false
---

# Les tokens de design dans Tailwind v4, sans fichier de config

En v3, tout partait d'un objet JavaScript. En v4, les tokens sont de simples custom properties CSS déclarées dans un bloc `@theme`, et Tailwind génère les utilitaires à partir d'elles.

```css
@theme {
  --font-sans: 'Plus Jakarta Sans', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  --radius-none: 0rem;
}
```

## Pourquoi c'est mieux que ça en a l'air

Une custom property est une vraie valeur à l'exécution. Tes tokens apparaissent donc dans l'inspecteur du navigateur, fonctionnent dans un `calc()`, et peuvent être surchargés par une media query ou une classe sans rien reconstruire.

Ça fait aussi disparaître une catégorie de duplication. Avant, la même couleur existait à trois endroits : la config, une variable CSS, et le nom que lui donnait le fichier Figma du designer. Maintenant il y a une seule déclaration, et les utilitaires en découlent.

## L'arête coupante

Comme les utilitaires sont générés depuis le thème, un token que tu n'utilises jamais existe quand même dans le CSS si quelque chose d'autre l'utilise. Et surcharger un token après coup ne régénère pas les utilitaires construits à partir de lui à la compilation.

La conséquence pratique : choisis les noms de tes tokens avant de construire le système, pas après. Renommer `--color-brand` en `--color-primary` est un chercher-remplacer, mais seulement si tu n'en as pas déjà semé un des deux dans cent composants.

## Ce que j'ai réellement changé

J'ai arrêté d'écrire un fichier de config, tout simplement. Toute l'identité visuelle de ce site — trois polices, aucun arrondi, une poignée de couleurs sémantiques — tient en une quinzaine de lignes de CSS.
