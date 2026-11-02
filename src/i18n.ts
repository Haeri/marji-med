import { getCollection, getEntry, type CollectionKey } from 'astro:content';

export const LOCALES = ['en', 'ru', 'ka'] as const;
export type Lang = (typeof LOCALES)[number];
export const LANGUAGE_NAMES: Record<Lang, string> = { en: 'English', ru: 'Русский', ka: 'ქართული' };

// English sits at the root; other languages under /ru/ and /ka/.
export const langPaths = () => LOCALES.map((lang) => ({ params: { lang: lang === 'en' ? undefined : lang }, props: { lang } }));
export const localize = (lang: Lang, path: string) => (lang === 'en' ? path : `/${lang}${path}`);

export const slugOf = (id: string) => id.split('/')[1];
export const inLang = <C extends CollectionKey>(collection: C, lang: Lang) =>
  getCollection(collection, (e: { id: string }) => e.id.startsWith(`${lang}/`));

// A missing translation fails the build rather than quietly showing another language.
export async function entry<C extends CollectionKey>(collection: C, lang: Lang, slug: string) {
  const found = await getEntry(collection, `${lang}/${slug}` as never);
  if (!found) throw new Error(`Missing translation: src/content/${collection}/${lang}/${slug}`);
  return found;
}

export const formatDate = (d: Date, lang: Lang) => d.toLocaleDateString(lang === 'en' ? 'en-GB' : lang, { day: 'numeric', month: 'long', year: 'numeric' });
