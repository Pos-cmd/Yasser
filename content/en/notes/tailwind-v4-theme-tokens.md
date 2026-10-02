---
title: Design tokens in Tailwind v4 without a config file
description: The @theme block replaced tailwind.config.js, and it changes how you think about your design system.
date: 2025-06-02
tags:
  - Tailwind
  - CSS
  - Design
draft: false
---

# Design tokens in Tailwind v4 without a config file

In v3, everything started from a JavaScript object. In v4, tokens are plain CSS custom properties declared in an `@theme` block, and Tailwind generates the utilities from them.

```css
@theme {
  --font-sans: 'Plus Jakarta Sans', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  --radius-none: 0rem;
}
```

## Why this is better than it looks

A custom property is a real runtime value. That means your tokens show up in the browser inspector, work inside `calc()`, and can be overridden by a media query or a class without rebuilding anything.

It also collapses a category of duplication. Before, the same colour existed in three places: the config, a CSS variable, and whatever the designer's Figma file called it. Now there is one declaration, and the utilities are derived.

## The sharp edge

Because the utilities are generated from the theme, a token you never reference still exists in the CSS if something else does. And overriding a token after the fact does not regenerate utilities that were built from it at compile time.

The practical consequence: pick your token names before you build the system, not after. Renaming `--color-brand` to `--color-primary` is a find-and-replace, but only if you have not already scattered one of them through a hundred components.

## What I actually changed

I stopped writing a config file at all. The entire visual identity of this site — three fonts, no border radius, a handful of semantic colours — is roughly fifteen lines of CSS.
