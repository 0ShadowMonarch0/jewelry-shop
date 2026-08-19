import type { Product, SiteSettings } from '../src/types.js';

// Social/link-preview crawlers that never execute JS, so they only ever see
// whatever HTML is returned for the very first request — this list gates
// which requests get the meta-only page instead of the normal SPA shell.
const BOT_USER_AGENT_PATTERN =
  /facebookexternalhit|twitterbot|slackbot|discordbot|linkedinbot|whatsapp|telegrambot|pinterest|redditbot|googlebot|bingbot|yandex|embedly|quora link preview|vkshare|w3c_validator|outbrain|nuzzel|skypeuripreview|nextdoorbot|opengraph|iframely/i;

export function isBotUserAgent(userAgent: string | undefined | null): boolean {
  return !!userAgent && BOT_USER_AGENT_PATTERN.test(userAgent);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderProductMetaHtml(product: Product, settings: SiteSettings, canonicalUrl: string): string {
  const storeName = settings.storeName || 'mini2k';
  const title = escapeHtml(`${product.name} | ${storeName}`);
  const rawDescription = product.description || settings.tagline || '';
  const description = escapeHtml(rawDescription.length > 200 ? rawDescription.slice(0, 197) + '...' : rawDescription);
  const primaryImage = product.images.find(i => i.isPrimary) || product.images[0];
  const image = escapeHtml(primaryImage?.secureUrl || settings.heroImageUrl || '');
  const url = escapeHtml(canonicalUrl);
  const currency = (settings.currencySymbol || 'NPR').trim();

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>${title}</title>
<meta name="description" content="${description}" />
<link rel="canonical" href="${url}" />
<meta property="og:site_name" content="${escapeHtml(storeName)}" />
<meta property="og:type" content="product" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />
<meta property="og:url" content="${url}" />
<meta property="og:image" content="${image}" />
<meta property="product:price:amount" content="${product.price}" />
<meta property="product:price:currency" content="${escapeHtml(currency)}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${description}" />
<meta name="twitter:image" content="${image}" />
</head>
<body>
<h1>${title}</h1>
<p>${description}</p>
<p>${escapeHtml(currency)} ${product.price.toLocaleString()}</p>
<a href="${url}">View on ${escapeHtml(storeName)}</a>
</body>
</html>`;
}
