/** Accept only encrypted external links before putting persisted data into href. */
export function getSafeExternalUrl(value: string | null | undefined): string | null {
  if (!value) return null;

  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
}

/** Keep project images inside the intended public image directory. */
export function getSafeImagePath(value: string | null | undefined): string | null {
  if (!value || !value.startsWith('/img/') || value.includes('\\')) return null;

  try {
    const decodedPath = decodeURIComponent(value);
    if (/\p{Cc}/u.test(decodedPath)) return null;
    if (decodedPath.split('/').some((segment) => segment === '.' || segment === '..')) return null;
    return value;
  } catch {
    return null;
  }
}
