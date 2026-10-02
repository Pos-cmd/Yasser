---
title: Structuring Nuxt Content into collections that make sense
description: Splitting one catch-all collection into a few typed ones, and the routing gotcha that comes with it.
date: 2025-08-14
tags:
  - Nuxt
  - Content
  - TypeScript
draft: false
---

# Structuring Nuxt Content into collections that make sense

The starter ships with a single collection:

```ts
content: defineCollection({ type: 'page', source: '**' })
```

That is fine until it isn't. The moment you want a `start` date on an experience entry and a `draft` flag on a note, one collection means one schema covering both — so every field becomes optional and you lose the typing that made you pick Nuxt Content in the first place.

## One collection per content type

The path of a document is its location inside `content/`, not the glob that matched it. So `content/notes/hello.md` is `/notes/hello` no matter which collection claims it. That means splitting is free from a routing point of view:

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

Now `date` is a real `Date` in your templates, and forgetting it is a build error rather than a page that renders `undefined`.

## The gotcha

A catch-all route that used to work stops working immediately:

```ts
queryCollection('content').path(route.path).first() // no longer matches anything
```

With several page collections you have to ask each one. Chain them with `??` so the lookups short-circuit instead of running four queries on every request:

```ts
return (
  (await queryCollection('pages').path(path).first()) ??
  (await queryCollection('notes').path(path).first()) ??
  null
)
```

I spent a confusing twenty minutes convinced the content was missing before realising it was there all along, in a collection nobody was querying.

## When one collection is still the right call

If everything really does share a shape, keep it simple. The split earns its keep as soon as two content types need different required fields — before that, it is ceremony.
