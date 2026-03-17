import type { APIRoute } from 'astro';

const SITE_URL = 'https://voorste-eng.nl';

export const GET: APIRoute = async () => {
    const robotsTxt = `
User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap-index.xml
    `.trim();

    return new Response(robotsTxt, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
        },
    });
};
