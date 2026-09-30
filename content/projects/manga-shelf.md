---
title: Manga Shelf
description: A small app to track what I'm reading, built because every existing tracker wanted an account first.
year: 2024
stack:
  - Nuxt
  - SQLite
  - Drizzle
  - Tailwind CSS
repo: "https://github.com/"
featured: true
order: 1
---

# Manga Shelf

I read a lot of manga and I kept losing track of which volumes I owned and where I'd stopped reading. Every tracker I tried wanted an account, a subscription, or both. So I built the version I wanted: local, offline, and fast.

## What it does

- Tracks series, volumes and reading progress.
- Works fully offline — the data lives in a single SQLite file you can move around.
- Imports from a plain text list, because typing 200 volumes by hand is not a personality trait.

## What I'd do differently

I started with the database schema and treated the UI as an afterthought. If I rebuilt it, I'd sketch the reading screen first — the data model ended up being the easy part anyway.

[← All projects](/projects)
