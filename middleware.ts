import { next, rewrite } from '@vercel/edge';

// Vercel serves /product/:slug straight from the static CDN (see the catch-all
// rewrite in vercel.json), which never runs our Express app — so it can never
// return per-product meta tags there. This Edge Middleware runs ahead of that
// static routing and, only for known social-preview crawlers, redirects the
// request to the API route that builds the correct HTML for that product.
// Real visitors are untouched and keep hitting the normal SPA shell.
const BOT_USER_AGENT_PATTERN =
  /facebookexternalhit|twitterbot|slackbot|discordbot|linkedinbot|whatsapp|telegrambot|pinterest|redditbot|googlebot|bingbot|yandex|embedly|quora link preview|vkshare|w3c_validator|outbrain|nuzzel|skypeuripreview|nextdoorbot|opengraph|iframely/i;

export default function middleware(request: Request) {
  const userAgent = request.headers.get('user-agent') || '';
  if (!BOT_USER_AGENT_PATTERN.test(userAgent)) {
    return next();
  }

  const url = new URL(request.url);
  const match = url.pathname.match(/^\/product\/([^/]+)\/?$/);
  if (!match) {
    return next();
  }

  return rewrite(new URL(`/api/product-meta/${match[1]}`, request.url));
}

export const config = {
  matcher: '/product/:slug*'
};
