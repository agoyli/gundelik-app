/*
 * Where the content comes from.
 *
 * Every subject, theme, lesson, test bank and mini-app is *fetched*, not
 * compiled in. Nothing in the app names a file: the screens ask this module for
 * a path under a base URL, and the base URL is configuration.
 *
 *   default            `<app>/data/…`   — the files served next to the app
 *   VITE_DATA_URL      any origin       — a real API, a CDN, a staging bucket
 *   configureSource()  at runtime       — e.g. a school's own server, chosen
 *                                         after the app has already started
 *
 * That is the whole difference between "the content ships with this build" and
 * "the content is published on its own": adding a subject, rewriting a lesson
 * or fixing one answer in a test bank is a file on the server, never a release
 * of the app. The import script writes exactly the tree this expects, so the
 * default base is a working API served from `public/data`.
 *
 * The endpoints, all plain JSON over GET:
 *   curriculum.json               every subject, its grades, its themes
 *   lessons/<grade>-<slug>.json   the written lessons for one subject-grade
 *   apps/<grade>/<slug>/<file>    an interactive mini-app (HTML, not JSON)
 */

const trim = (url: string) => url.replace(/\/+$/, '');

let base = trim(import.meta.env.VITE_DATA_URL || `${import.meta.env.BASE_URL}data`);

/** Point the app at another content source. Clears anything already fetched. */
export const configureSource = (url: string) => {
  base = trim(url);
  cache.clear();
};

export const sourceUrl = (path: string) => `${base}/${path.replace(/^\/+/, '')}`;

/* One request per path for the life of the session — a lesson file holds a
   whole subject-grade, and the reader walks through it one theme at a time. */
const cache = new Map<string, Promise<unknown>>();

const request = async <T>(path: string, optional: boolean): Promise<T | null> => {
  const url = sourceUrl(path);
  const res = await fetch(url);
  /* A missing lesson file is an answer, not a failure: most themes in the
     programme have nothing written for them yet.

     "Missing" is not only a 404. Static hosts — and Vite's own dev server —
     answer an unknown path with the app's `index.html` and a cheerful 200, so a
     document that is plainly not JSON counts as missing too. Without this the
     lesson screen waits forever on a page of HTML it will never parse. */
  const missing = res.status === 404
    || !(res.headers.get('content-type') ?? '').includes('json');
  if (missing) {
    if (optional) return null;
    throw new Error(`${res.status} — ${url} did not answer with JSON`);
  }
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${url}`);
  return res.json() as Promise<T>;
};

const fetchJson = <T>(path: string, optional: boolean): Promise<T | null> => {
  const key = sourceUrl(path);
  if (!cache.has(key)) {
    /* a failed request must not be remembered as an answer */
    cache.set(key, request<T>(path, optional).catch((e) => { cache.delete(key); throw e; }));
  }
  return cache.get(key) as Promise<T | null>;
};

/** Fetch a document that must exist — a missing one is an error. */
export const getJson = <T>(path: string) => fetchJson<T>(path, false) as Promise<T>;

/** Fetch a document that may not exist yet — missing reads as `null`. */
export const getJsonOptional = <T>(path: string) => fetchJson<T>(path, true);
