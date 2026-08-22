import { Head, Html, Main, NextScript } from 'next/document';

function getSupabaseConnectSources(): string[] {
  const configuredUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!configuredUrl) return [];

  try {
    const url = new URL(configuredUrl);
    if (url.protocol !== 'https:') return [];
    return [url.origin, url.origin.replace(/^https:/, 'wss:')];
  } catch {
    return [];
  }
}

const connectSources = ["'self'", ...getSupabaseConnectSources(), 'https://formspree.io'];

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-src 'none'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src ${connectSources.join(' ')}`,
  "form-action 'self' https://formspree.io",
  "worker-src 'self' blob:",
  'upgrade-insecure-requests',
].join('; ');

export default function Document() {
  return (
    <Html lang="es">
      <Head>
        <meta httpEquiv="Content-Security-Policy" content={contentSecurityPolicy} />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
