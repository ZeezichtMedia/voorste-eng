import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import alpine from "@astrojs/alpinejs";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";

// https://astro.build/config
export default defineConfig({
  site: 'https://voorste-eng.nl',
  output: 'server',
  adapter: vercel(),
  integrations: [tailwind(), alpine(), sitemap()],
  i18n: {
    defaultLocale: "nl",
    locales: ["nl", "en", "de"],
    routing: {
      prefixDefaultLocale: true
    }
  }
});