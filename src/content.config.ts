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
    demoLink: z.string(),
    repoLink: z.string()
  }),
});

const aboutCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/about' }),
});

const othelloCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/othello' }),
});

export const collections = {
  'projects': projectsCollection,
  'about': aboutCollection,
  'othello': othelloCollection,
};
