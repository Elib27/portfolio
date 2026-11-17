import { defineConfig } from 'astro/config';
import solidJs from "@astrojs/solid-js";
import mdx from "@astrojs/mdx";

// https://astro.build/config
export default defineConfig({
  site: "https://eliotbas.com/",
  integrations: [solidJs(), mdx()],
  // French site is disabled: /fr is served as a redirect to the English site.
  // The French routes are parked in src/pages/_fr (underscore = not routed) so the
  // French build can be restored later by moving the folder back to src/pages/fr.
  redirects: {
    '/fr': '/',
  },
});
