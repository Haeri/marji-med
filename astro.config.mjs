import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // Replace with the real domain before launch: canonical URLs and the sitemap use it.
  site: 'https://haeri.github.io',
  base: '/marji-med',
  trailingSlash: 'always',
  integrations: [sitemap({ i18n: { defaultLocale: 'en', locales: { en: 'en', ru: 'ru', ka: 'ka' } } })],
});
