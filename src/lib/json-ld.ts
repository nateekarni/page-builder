/**
 * JSON-LD Schema Builders — Structured Data for SEO/AEO
 *
 * Pure functions that take settings/page data and return JSON-LD objects.
 * Used in SEOHead.astro to inject structured data into <head>.
 *
 * Clean Code: each builder is a pure function → input: data → output: JSON-LD object.
 */

interface OrganizationInput {
  name: string;
  url: string;
  logo?: string;
  description?: string;
  email?: string;
  phone?: string;
  socialLinks?: string[];
}

interface LocalBusinessInput {
  name: string;
  url: string;
  logo?: string;
  description?: string;
  address?: {
    street?: string;
    locality?: string;
    region?: string;
    postalCode?: string;
    country?: string;
  };
  phone?: string;
  email?: string;
  openingHours?: string[];
  geo?: { lat: number; lng: number };
}

interface ArticleInput {
  title: string;
  description?: string;
  url: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
  authorName?: string;
  publisherName: string;
  publisherLogo?: string;
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

/**
 * Builds Organization JSON-LD schema.
 */
export function buildOrganizationSchema(input: OrganizationInput): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: input.name,
    url: input.url,
  };

  if (input.logo) schema.logo = input.logo;
  if (input.description) schema.description = input.description;
  if (input.email) schema.email = input.email;
  if (input.phone) schema.telephone = input.phone;
  if (input.socialLinks?.length) schema.sameAs = input.socialLinks;

  return schema;
}

/**
 * Builds LocalBusiness JSON-LD schema.
 */
export function buildLocalBusinessSchema(input: LocalBusinessInput): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: input.name,
    url: input.url,
  };

  if (input.logo) schema.image = input.logo;
  if (input.description) schema.description = input.description;
  if (input.phone) schema.telephone = input.phone;
  if (input.email) schema.email = input.email;

  if (input.address) {
    schema.address = {
      '@type': 'PostalAddress',
      ...(input.address.street && { streetAddress: input.address.street }),
      ...(input.address.locality && { addressLocality: input.address.locality }),
      ...(input.address.region && { addressRegion: input.address.region }),
      ...(input.address.postalCode && { postalCode: input.address.postalCode }),
      ...(input.address.country && { addressCountry: input.address.country }),
    };
  }

  if (input.openingHours?.length) {
    schema.openingHoursSpecification = input.openingHours;
  }

  if (input.geo) {
    schema.geo = {
      '@type': 'GeoCoordinates',
      latitude: input.geo.lat,
      longitude: input.geo.lng,
    };
  }

  return schema;
}

/**
 * Builds Article JSON-LD schema (for blog-type pages).
 */
export function buildArticleSchema(input: ArticleInput): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.title,
    url: input.url,
  };

  if (input.description) schema.description = input.description;
  if (input.image) schema.image = input.image;
  if (input.datePublished) schema.datePublished = input.datePublished;
  if (input.dateModified) schema.dateModified = input.dateModified;

  if (input.authorName) {
    schema.author = {
      '@type': 'Person',
      name: input.authorName,
    };
  }

  schema.publisher = {
    '@type': 'Organization',
    name: input.publisherName,
    ...(input.publisherLogo && {
      logo: { '@type': 'ImageObject', url: input.publisherLogo },
    }),
  };

  return schema;
}

/**
 * Builds BreadcrumbList JSON-LD schema.
 * Auto-generated from page hierarchy.
 */
export function buildBreadcrumbSchema(items: BreadcrumbItem[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Builds WebSite JSON-LD schema with SearchAction.
 */
export function buildWebSiteSchema(input: { name: string; url: string }): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: input.name,
    url: input.url,
  };
}
