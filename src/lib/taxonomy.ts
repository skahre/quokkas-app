import { File, Paths } from "expo-file-system";

const BASE = "https://static.openfoodfacts.org/data/taxonomies";
const CACHE_FILE = "taxonomy-v2.json";
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // refresh about monthly
const MAX_RESULTS = 15;

type Entry = [id: string, name: string, keys: string[], parents: string[]];
type Cache = { savedAt: number; entries: Entry[] };

export type TaxonomyResult = { id: string; name: string };

/* ---------- text helpers ---------- */

const FOLD: Record<string, string> = {
  å: "a",
  ä: "a",
  æ: "a",
  ö: "o",
  ø: "o",
  é: "e",
  è: "e",
  ê: "e",
  ü: "u",
  ñ: "n",
  ç: "c",
};
export const normalize = (s: string) =>
  s
    .toLowerCase()
    .replace(/[åäæöøéèêüñç]/g, (c) => FOLD[c] ?? c)
    .replace(/\s+/g, " ")
    .trim();

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const asStrings = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];

/* ---------- building the index ---------- */

function toEntries(raw: unknown): Entry[] {
  if (!raw || typeof raw !== "object") return [];
  const out: Entry[] = [];

  for (const [id, node] of Object.entries(raw as Record<string, any>)) {
    const names = node?.name ?? {};
    const synonyms = node?.synonyms ?? {};
    const sv = typeof names.sv === "string" ? names.sv : undefined;
    const en = typeof names.en === "string" ? names.en : undefined;

    const display = sv ?? en;
    if (!display) continue; // nothing we could show

    const words = [
      sv,
      en,
      ...asStrings(synonyms.sv),
      ...asStrings(synonyms.en),
    ];
    const keys = Array.from(
      new Set(words.filter((w): w is string => !!w).map(normalize)),
    );
    out.push([id, capitalize(display), keys, asStrings(node?.parents)]);
  }
  return out;
}

async function fetchTaxonomy(name: string, headers: Record<string, string>) {
  const res = await fetch(`${BASE}/${name}.json`, { headers });
  if (!res.ok)
    throw new Error(`Could not download ${name} taxonomy (${res.status})`);
  return res.json();
}

async function download(headers: Record<string, string>): Promise<Entry[]> {
  const allergens = toEntries(await fetchTaxonomy("allergens", headers));
  const ingredients = toEntries(await fetchTaxonomy("ingredients", headers));

  const seen = new Set<string>();
  return [...allergens, ...ingredients].filter((e) => {
    if (seen.has(e[0])) return false;
    seen.add(e[0]);
    return true;
  });
}

/* ---------- on-device copy ---------- */

async function loadCache(): Promise<Cache | null> {
  try {
    const file = new File(Paths.document, CACHE_FILE);
    if (!file.exists) return null;
    const parsed = JSON.parse(await file.text());
    return Array.isArray(parsed?.entries) ? (parsed as Cache) : null;
  } catch {
    return null;
  }
}

function saveCache(entries: Entry[]) {
  try {
    const file = new File(Paths.document, CACHE_FILE);
    if (!file.exists) file.create();
    file.write(JSON.stringify({ savedAt: Date.now(), entries }));
  } catch (e) {
    console.warn("Could not save the taxonomy copy", e);
  }
}

let index: Entry[] | null = null;
let loading: Promise<Entry[]> | null = null;

export function ensureTaxonomy(
  headers: Record<string, string>,
): Promise<Entry[]> {
  if (index) return Promise.resolve(index);

  if (!loading) {
    loading = (async () => {
      const cached = await loadCache();
      if (cached && Date.now() - cached.savedAt < MAX_AGE_MS) {
        return (index = cached.entries);
      }
      try {
        const entries = await download(headers);
        saveCache(entries);
        return (index = entries);
      } catch (e) {
        if (cached) return (index = cached.entries);
        throw e;
      }
    })().finally(() => {
      loading = null;
    });
  }
  return loading;
}

/* ---------- searching ---------- */

// 0 = exact, 1 = starts with, 2 = a word starts with, 3 = contains, 4 = no match
function bestRank(keys: string[], q: string): number {
  let best = 4;
  for (const k of keys) {
    if (k === q) return 0;
    if (k.startsWith(q)) best = Math.min(best, 1);
    else if (k.includes(" " + q)) best = Math.min(best, 2);
    else if (q.length >= 3 && k.includes(q)) best = Math.min(best, 3);
  }
  return best;
}

export async function searchTaxonomy(
  query: string,
  headers: Record<string, string>,
): Promise<TaxonomyResult[]> {
  const q = normalize(query);
  if (!q) return [];
  const entries = await ensureTaxonomy(headers);

  const hits: { entry: Entry; rank: number }[] = [];
  for (const entry of entries) {
    const rank = bestRank(entry[2], q);
    if (rank < 4) hits.push({ entry, rank });
  }

  hits.sort(
    (a, b) =>
      a.rank - b.rank ||
      a.entry[1].length - b.entry[1].length || // shorter = more basic
      a.entry[1].localeCompare(b.entry[1], "sv"),
  );

  return hits
    .slice(0, MAX_RESULTS)
    .map(({ entry }) => ({ id: entry[0], name: entry[1] }));
}

/* ---------- related words, for highlighting ingredient lists ---------- */

let byId: Map<string, Entry> | null = null;
let childrenOf: Map<string, string[]> | null = null;

function graph() {
  if (!index) return null;
  if (!byId || !childrenOf) {
    byId = new Map();
    childrenOf = new Map();
    for (const entry of index) {
      byId.set(entry[0], entry);
      for (const parent of entry[3]) {
        const list = childrenOf.get(parent);
        if (list) list.push(entry[0]);
        else childrenOf.set(parent, [entry[0]]);
      }
    }
  }
  return { byId, childrenOf };
}

export function ownKeysFor(id: string): string[] {
  return graph()?.byId.get(id)?.[2] ?? [];
}

export function relatedKeysFor(id: string, limit = 800): string[] {
  const g = graph();
  if (!g) return [];

  const keys = new Set<string>();
  const seen = new Set<string>([id]);
  const queue = [...(g.childrenOf.get(id) ?? [])];

  while (queue.length > 0 && keys.size < limit) {
    const child = queue.shift()!;
    if (seen.has(child)) continue;
    seen.add(child);
    g.byId.get(child)?.[2].forEach((k) => keys.add(k));
    queue.push(...(g.childrenOf.get(child) ?? []));
  }
  return Array.from(keys);
}
