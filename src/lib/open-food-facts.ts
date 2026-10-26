import type { Restriction } from "@/context/profile-context";

const USER_AGENT = "FoodScanner/1.0 (skahre@kth.se)";
const HEADERS = { "User-Agent": USER_AGENT, Accept: "application/json" };

const SEARCH_URL = "https://search.openfoodfacts.org/search";
const PRODUCT_URL = "https://world.openfoodfacts.org/api/v2/product";

const SEARCH_FIELDS =
  "code,product_name,brands,image_small_url,image_front_small_url,image_url";
const DETAIL_FIELDS =
  "code,product_name,brands,image_front_small_url,allergens_tags,traces_tags,ingredients_text";

/** OFF allows 10 searches and 15 product reads per minute (per user in apps). */
export class RateLimitError extends Error {}

export type FoodProduct = {
  code: string;
  name: string;
  brand: string;
  imageUrl?: string;
};

export type ProductDetails = FoodProduct & {
  contains: string[];
  traces: string[];
  hasIngredients: boolean;
};

// TODO: Replace (get allergens from API as well)
const ALLERGEN_NAMES: Record<string, string> = {
  "en:gluten": "Gluten",
  "en:crustaceans": "Skaldjur",
  "en:molluscs": "Skaldjur",
  "en:eggs": "Ägg",
  "en:fish": "Fisk",
  "en:peanuts": "Jordnötter",
  "en:soybeans": "Sojabönor",
  "en:milk": "Mjölk",
  "en:nuts": "Nötter",
  "en:celery": "Selleri",
  "en:mustard": "Senap",
  "en:sesame-seeds": "Sesamfrön",
  "en:sulphur-dioxide-and-sulphites": "Sulfiter",
  "en:lupin": "Lupin",
};
const CHECKABLE = new Set(Object.values(ALLERGEN_NAMES));

/* ---------- helpers ---------- */

async function getJson(url: string, signal?: AbortSignal) {
  const res = await fetch(url, { headers: HEADERS, signal });
  if (res.status === 429) throw new RateLimitError();
  if (!res.ok) throw new Error(`Open Food Facts responded ${res.status}`);
  return res.json();
}

const escapeLucene = (q: string) =>
  q.replace(/([+\-!(){}[\]^"~*?:\\/]|&&|\|\|)/g, "\\$1");

function pickText(v: unknown): string {
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return pickText(v[0]);
  if (v && typeof v === "object") {
    const o = v as Record<string, unknown>;
    return pickText(o.sv ?? o.en ?? Object.values(o)[0]);
  }
  return "";
}

const firstBrand = (v: unknown) => pickText(v).split(",")[0].trim();

function toAppNames(tags: unknown): string[] {
  if (!Array.isArray(tags)) return [];
  const names = tags.flatMap((t) => {
    const name = ALLERGEN_NAMES[String(t)];
    return name ? [name] : [];
  });
  return Array.from(new Set(names));
}

/* ---------- API ---------- */

const searchCache = new Map<string, FoodProduct[]>();
const detailsCache = new Map<string, ProductDetails>();

export async function searchProducts(
  query: string,
  signal?: AbortSignal,
): Promise<FoodProduct[]> {
  const q = query.trim();
  const key = q.toLowerCase();
  const cached = searchCache.get(key);
  if (cached) return cached;

  const url =
    `${SEARCH_URL}?q=${encodeURIComponent(escapeLucene(q))}` +
    `&langs=sv,en&page_size=20&fields=${SEARCH_FIELDS}`;
  const data = await getJson(url, signal);

  const products = ((data.hits ?? []) as Record<string, unknown>[]).flatMap(
    (hit): FoodProduct[] => {
      const code = String(hit.code ?? "");
      const name = pickText(hit.product_name);
      if (!code || !name) return [];
      const imageUrl =
        pickText(hit.image_small_url) ||
        pickText(hit.image_front_small_url) ||
        pickText(hit.image_url) ||
        undefined;
      return [{ code, name, brand: firstBrand(hit.brands), imageUrl }];
    },
  );

  searchCache.set(key, products);
  return products;
}

/** Full product info (allergens, traces) for one barcode. */
export async function getProductDetails(
  code: string,
  signal?: AbortSignal,
): Promise<ProductDetails> {
  const cached = detailsCache.get(code);
  if (cached) return cached;

  const data = await getJson(
    `${PRODUCT_URL}/${encodeURIComponent(code)}.json?fields=${DETAIL_FIELDS}`,
    signal,
  );
  const p = data.product;
  if (!p) throw new Error("Product not found");

  const details: ProductDetails = {
    code,
    name: pickText(p.product_name) || "Okänd produkt",
    brand: firstBrand(p.brands),
    imageUrl: pickText(p.image_front_small_url) || undefined,
    contains: toAppNames(p.allergens_tags),
    traces: toAppNames(p.traces_tags),
    hasIngredients: pickText(p.ingredients_text).trim().length > 0,
  };
  detailsCache.set(code, details);
  return details;
}

export function uncheckable(
  restrictions: Restriction[],
  details: ProductDetails,
): string[] {
  return restrictions
    .filter((r) => !details.hasIngredients || !CHECKABLE.has(r.name))
    .map((r) => r.name);
}
