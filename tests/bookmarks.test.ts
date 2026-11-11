import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createSlug,
  formatBookmark,
  normalizeUrl,
  parseBookmarks,
} from '../src/lib/bookmarks.ts';

test('normalizes URLs with and without https to the same value', () => {
  assert.equal(
    normalizeUrl('www.example.com/notes'),
    normalizeUrl('https://www.example.com/notes'),
  );
  assert.equal(normalizeUrl(' www.example.com/notes '), 'https://www.example.com/notes');
});

test('recovers gracefully from empty, corrupted, legacy, and non-array storage', () => {
  assert.deepEqual(parseBookmarks(null), []);
  assert.deepEqual(parseBookmarks(''), []);
  assert.deepEqual(parseBookmarks('{not json'), []);
  assert.deepEqual(parseBookmarks(JSON.stringify(['https://example.com', { link: 'https://example.com' }])), []);
  assert.deepEqual(parseBookmarks(JSON.stringify({ url: 'https://example.com', slug: 'mona-7fk2' })), []);
});

test('drops malformed objects when loading an otherwise valid bookmark array', () => {
  assert.deepEqual(
    parseBookmarks(JSON.stringify([
      { url: 'https://example.com', slug: 'mona-7fk2', ignored: true },
      { url: 'javascript:alert(1)', slug: 'mona-abcd' },
      { url: 'https://example.com', slug: 'legacy-slug' },
      null,
    ])),
    [{ url: 'https://example.com/', slug: 'mona-7fk2' }],
  );
});

test('formats a saved bookmark with the exact visible separator', () => {
  assert.equal(
    formatBookmark({ url: 'https://www.example.com', slug: 'mona-7fk2' }),
    'https://www.example.com :: mona-7fk2',
  );
});

test('creates a short base62 slug with the mona prefix', () => {
  assert.equal(createSlug(0), 'mona-0000');
  assert.match(createSlug(0.5), /^mona-[0-9A-Za-z]{4}$/);
});
