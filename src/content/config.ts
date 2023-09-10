import { z, defineCollection } from 'astro:content';

const projectsCollection = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    title: z.string(),
    technologies: z.string(),
    cover: image(),
    coverAlt: z.string(),
    demoLink: z.string(),
    repoLink: z.string()
  }),
});

export const collections = {
  'projects': projectsCollection,
  
};