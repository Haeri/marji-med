import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const inFolder = (name: string, pattern: string) => glob({ pattern: `*/${pattern}`, base: `src/content/${name}` });

const image = {
  image: z.string().optional(),
  imageAlt: z.string().optional(),
  imageCredit: z.string().optional(),
};

// `reviewed: false` shows a draft notice and sets noindex. Tick it per language once a clinician has signed off.
const page = z.object({
  title: z.string(),
  description: z.string().max(200),
  lede: z.string().optional(),
  reviewed: z.boolean(),
  ...image,
});

const pages = defineCollection({ loader: inFolder('pages', '*.md'), schema: page });

const articles = defineCollection({
  loader: inFolder('articles', '*.md'),
  schema: page.extend({
    date: z.coerce.date(),
    author: z.string(),
    reviewStatus: z.enum(['peer-reviewed', 'author-publication']),
    disclosure: z.string().optional(),
  }),
});

const results = defineCollection({
  loader: inFolder('results', '*.md'),
  schema: z.object({
    title: z.string(),
    location: z.string(),
    status: z.enum(['data-pending', 'partly-published', 'complete']),
    order: z.number(),
    ...image,
  }),
});

const publications = defineCollection({
  loader: inFolder('publications', '*.yaml'),
  schema: z.object({
    year: z.number(),
    citation: z.string(),
    title: z.string(),
    design: z.string(),
    findings: z.string(),
    pmid: z.string(),
    doi: z.string().optional(),
  }),
});

const home = defineCollection({
  loader: inFolder('settings', 'home.yaml'),
  schema: z.object({
    title: z.string(),
    description: z.string().max(200),
    lede: z.string(),
    reviewed: z.boolean(),
    heading: z.string(),
    primaryLink: z.string(),
    secondaryLink: z.string(),
    howHeading: z.string(),
    steps: z.array(z.object({ title: z.string(), text: z.string() })),
    figuresHeading: z.string(),
    figures: z.array(z.object({ value: z.string(), label: z.string(), source: z.string() })),
    figuresNote: z.string(),
    figuresLink: z.string(),
    sectionsHeading: z.string(),
    sections: z.array(z.object({ title: z.string(), href: z.string(), summary: z.string(), image: z.string() })),
    latestHeading: z.string(),
  }),
});

// Interface wording that is not part of any single page.
const ui = defineCollection({
  loader: inFolder('settings', 'ui.yaml'),
  schema: z.object({
    siteName: z.string(),
    homeTitleSuffix: z.string(),
    navHistory: z.string(),
    navComparison: z.string(),
    navApplications: z.string(),
    navMethodology: z.string(),
    navResults: z.string(),
    navArticles: z.string(),
    navTraining: z.string(),
    navAbout: z.string(),
    skipLink: z.string(),
    languageLabel: z.string(),
    footerText: z.string(),
    footerSite: z.string(),
    footerLegal: z.string(),
    navImpressum: z.string(),
    navPrivacy: z.string(),
    navNotice: z.string(),
    pubmedLink: z.string(),
    rightsReserved: z.string(),
    timingSense: z.string(),
    timingWait: z.string(),
    timingImpulse: z.string(),
    timingNote: z.string(),
    onThisPage: z.string(),
    thighLabel: z.string(),
    calfLabel: z.string(),
    heroCredit: z.string(),
    systole: z.string(),
    diastole: z.string(),
    stimulus: z.string(),
    figureTitle: z.string(),
    figureDescription: z.string(),
    figureLabel: z.string(),
    figureCaption: z.string(),
    clinicalHeading: z.string(),
    evidenceHeading: z.string(),
    statusPending: z.string(),
    statusPartial: z.string(),
    statusComplete: z.string(),
    peerReviewed: z.string(),
    authorPublication: z.string(),
    authorNoticeTitle: z.string(),
    authorNotice: z.string(),
    disclosureTitle: z.string(),
  }),
});

export const collections = { pages, articles, results, publications, home, ui };
