import { defineMiddleware } from 'astro:middleware';

// The site is served from a sub-route for now, while content and pages link from the root.
// Remove this file and `base` in astro.config.mjs when the site moves to its own domain.
const base = import.meta.env.BASE_URL.replace(/\/$/, '');
const rootLink = new RegExp(`(href|src)="/(?!/|${base.slice(1)}/)`, 'g');

export const onRequest = defineMiddleware(async (_, next) => {
  const response = await next();
  if (!response.headers.get('content-type')?.includes('text/html')) return response;
  return new Response((await response.text()).replace(rootLink, `$1="${base}/`), response);
});
