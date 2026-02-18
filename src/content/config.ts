import { defineCollection, z } from "astro:content";


const articles = defineCollection({
    schema: z.object({title: z.string(), description: z.string(),date: z.date(),}),
});

const projects = defineCollection({
    schema: z.object({title: z.string(), description: z.string(), github: z.string().url()}),
});

export const collections = {articles, projects};