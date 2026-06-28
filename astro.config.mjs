import { defineConfig } from 'astro/config';
import solidJs from "@astrojs/solid-js";
import mdx from "@astrojs/mdx";

// https://astro.build/config
export default defineConfig({
  site: "https://eliotbas.com/",
  integrations: [solidJs(), mdx()],
});