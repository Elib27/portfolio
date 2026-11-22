import { defineConfig, fontProviders } from 'astro/config';
import solidJs from "@astrojs/solid-js";
import mdx from "@astrojs/mdx";

// https://astro.build/config
export default defineConfig({
  site: "https://eliotbas.com/",
  integrations: [solidJs(), mdx()],
  // Fonts are downloaded from Google at build time and served from this site,
  // so the page never waits on fonts.googleapis.com / fonts.gstatic.com.
  fonts: [
    {
      provider: fontProviders.google(),
      name: "Plus Jakarta Sans",
      cssVariable: "--font-body",
      weights: ["200 800"],
      styles: ["normal"],
      subsets: ["latin"],
    },
    {
      provider: fontProviders.google(),
      name: "Space Grotesk",
      cssVariable: "--font-heading",
      weights: ["300 700"],
      styles: ["normal"],
      subsets: ["latin"],
    },
  ],
  // French site is disabled: /fr is served as a redirect to the English site.
  // The French routes are parked in src/pages/_fr (underscore = not routed) so the
  // French build can be restored later by moving the folder back to src/pages/fr.
  redirects: {
    '/fr': '/',
    '/en': '/',
  },
});
