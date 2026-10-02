---
title: I stopped using barrel files
date: 2025-04-19
description: One index.ts re-exporting a folder felt tidy. It was quietly costing me build time and clarity.
draft: false
tags:
  - TypeScript
  - Tooling
---

# I stopped using barrel files

For a long time every folder had an `index.ts` that re-exported everything inside it:

```ts
export * from './Button'
export * from './Input'
export * from './Modal'
```

It made imports look clean and it felt like good structure. Then a project grew and the same import started to hurt.

## The problem

A barrel file is a module that imports everything, so anything touching it pulls in everything. In one project, importing a single formatting helper ended up dragging the whole UI kit into the test environment. Tests got slower, and nobody could work out why.

The second problem is circularity. Once every folder re-exports its neighbours, it is easy to create a cycle that TypeScript tolerates and your bundler does not. The error you eventually get points somewhere unrelated to the actual cause.

## What I do instead

Import from the file that actually owns the thing:

```ts
import { Button } from '~/components/Button.vue'
```

Slightly longer to type, much easier to trace. My editor's auto-import does the work anyway, and "where does this come from" now has an obvious answer.

## The nuance

Barrels are not evil. They earn their keep at a library's public boundary, where you deliberately want to hide the internal file layout from consumers. That is a real need. The mistake was doing it everywhere, by reflex, for tidiness.
