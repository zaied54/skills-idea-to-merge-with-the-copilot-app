export interface Bookmark {
  url: string;
  slug: string;
}

const slugPattern = /^mona-[0-9A-Za-z]{4}$/;
const base62Alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const slugRange = base62Alphabet.length ** 4;

export function normalizeUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const candidate = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : trimmed.startsWith('//')
      ? `https:${trimmed}`
      : `https://${trimmed}`;

  try {
    const url = new URL(candidate);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    return url.href;
  } catch {
    return null;
  }
}

export function createSlug(randomValue = Math.random()): string {
  const boundedValue = Number.isFinite(randomValue)
    ? Math.min(Math.max(randomValue, 0), 1 - Number.EPSILON)
    : 0;
  let value = Math.floor(boundedValue * slugRange);
  let suffix = '';

  for (let position = 0; position < 4; position += 1) {
    suffix = base62Alphabet[value % base62Alphabet.length] + suffix;
    value = Math.floor(value / base62Alphabet.length);
  }

  return `mona-${suffix}`;
}

export function formatBookmark(bookmark: Bookmark): string {
  return `${bookmark.url} :: ${bookmark.slug}`;
}

export function parseBookmarks(serialized: string | null): Bookmark[] {
  if (!serialized) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(serialized);
  } catch {
    return [];
  }

  if (!Array.isArray(parsed)) return [];

  const bookmarks: Bookmark[] = [];
  for (const item of parsed) {
    if (typeof item !== 'object' || item === null) continue;

    const candidate = item as Record<string, unknown>;
    if (typeof candidate.url !== 'string' || typeof candidate.slug !== 'string') continue;

    const url = normalizeUrl(candidate.url);
    if (!url || !slugPattern.test(candidate.slug)) continue;

    bookmarks.push({ url, slug: candidate.slug });
  }

  return bookmarks;
}
