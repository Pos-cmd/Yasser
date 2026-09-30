import { defineCollection, defineContentConfig, z } from '@nuxt/content'

const shelfItem = z.object({
  title: z.string(),
  kind: z.enum(['manga', 'book', 'film', 'music', 'series']),
  creator: z.string().optional(),
  year: z.number().optional(),
  // Tome affiche. Absent = tome 1. Le visuel peut etre regenere pour un autre tome.
  volume: z.number().optional(),
  cover: z.string().optional(),
  note: z.string()
})

const pageGroup = z.object({
  label: z.string(),
  icon: z.string().optional(),
  items: z.array(z.object({
    label: z.string(),
    icon: z.string().optional()
  })).optional(),
  links: z.array(z.object({
    label: z.string(),
    url: z.string(),
    note: z.string().optional(),
    // Pilote l'apercu : docs/tool n'affichent ni titre OG ni miniature,
    // article/video/thread/site les affichent quand ils existent.
    type: z.enum(['docs', 'tool', 'site', 'article', 'video', 'thread', 'paper', 'repo']).optional(),
    date: z.date().optional(),
    // Champs resolus automatiquement par `pnpm bookmarks`.
    title: z.string().optional(),
    description: z.string().optional(),
    image: z.string().optional(),
    site: z.string().optional()
  })).optional()
})

export default defineContentConfig({
  collections: {
    // Pages racines : about.md, skills.md, bookmarks.md, shelf.md
    pages: defineCollection({
      type: 'page',
      source: '*.md',
      schema: z.object({
        title: z.string(),
        description: z.string().optional(),
        groups: z.array(pageGroup).optional(),
        now: z.array(shelfItem).optional(),
        items: z.array(shelfItem).optional()
      })
    }),
    experience: defineCollection({
      type: 'page',
      source: 'experience/**/*.md',
      schema: z.object({
        role: z.string(),
        company: z.string(),
        companyUrl: z.string().optional(),
        location: z.string().optional(),
        start: z.date(),
        end: z.date().optional(),
        stack: z.array(z.string()).default([]),
        order: z.number().default(0)
      })
    }),
    projects: defineCollection({
      type: 'page',
      source: 'projects/**/*.md',
      schema: z.object({
        title: z.string(),
        description: z.string(),
        year: z.number().optional(),
        stack: z.array(z.string()).default([]),
        url: z.string().optional(),
        repo: z.string().optional(),
        cover: z.string().optional(),
        featured: z.boolean().default(false),
        order: z.number().default(0)
      })
    }),
    notes: defineCollection({
      type: 'page',
      source: 'notes/**/*.md',
      schema: z.object({
        title: z.string(),
        description: z.string(),
        date: z.date(),
        tags: z.array(z.string()).default([]),
        draft: z.boolean().default(false)
      })
    })
  }
})
