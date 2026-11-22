import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projectsCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    technologies: z.string(),
    cover: image(),
    coverAlt: z.string(),
    // Omitted for playable projects, which open inline instead of linking out
    demoLink: z.string().optional(),
    repoLink: z.string(),
    playable: z.boolean().default(false),
    hidden: z.boolean().default(false),
    order: z.number(),
  }),
});

const aboutCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/about' }),
});

export const collections = {
  'projects': projectsCollection,
  'about': aboutCollection,
};
