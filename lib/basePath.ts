const configuredBasePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
const basePath = configuredBasePath === '/' ? '' : configuredBasePath.replace(/\/+$/, '');

/**
 * Prefix a file from public/ with the configured GitHub Pages project path.
 * External URLs, hashes, data URLs and protocol links are returned unchanged.
 */
export function withBasePath(path: string): string {
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${basePath}${normalizedPath}`;
}
