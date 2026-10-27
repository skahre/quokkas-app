import type { Ingredient, Restriction } from "@/context/profile-context";
import { ensureTaxonomy, searchTaxonomy } from "./taxonomy";

// Open Food Facts asks every app to identify itself with a User-Agent.
// TODO: put your app's name, version and a real contact address here.
const USER_AGENT = "MyApp/1.0 (contact@example.com)";
const HEADERS = { "User-Agent": USER_AGENT, Accept: "application/json" };

const SEARCH_BASE = "https://search.openfoodfacts.org";
const PRODUCT_URL = "https://world.openfoodfacts.org/api/v2/product";
const TAXONOMY_URL = "https://world.openfoodfacts.org/api/v2/taxonomy";

const SEARCH_FIELDS =
  "code,product_name,brands,image_small_url,image_front_small_url,image_url";
const DETAIL_FIELDS =
  "code,product_name,generic_name,brands,image_front_url,image_front_small_url,allergens_tags,traces_tags,ingredients_tags,ingredients_text,nutriments";

export class RateLimitError extends Error {}

export type FoodProduct = {
  code: string;
  name: string;
  brand: string;
  imageUrl?: string;
};

export type Nutrition = {
  energyKj?: number;
  energyKcal?: number;
  fat?: number;
  saturatedFat?: number;
  carbohydrates?: number;
  sugars?: number;
  fiber?: number;
  protein?: number;
  salt?: number;
};

export type ProductDetails = FoodProduct & {
  contains: string[];
  traces: string[];
  hasIngredients: boolean;
  ingredientsText?: string;
  description?: string;
  nutrition: Nutrition;
};

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

const toTags = (v: unknown): string[] =>
  Array.isArray(v) ? v.map(String) : [];

function num(v: unknown): number | undefined {
  const n = typeof v === "string" ? parseFloat(v) : v;
  return typeof n === "number" && Number.isFinite(n) ? n : undefined;
}

function toNutrition(raw: unknown): Nutrition {
  const n = (raw ?? {}) as Record<string, unknown>;
  return {
    energyKj: num(n["energy-kj_100g"]),
    energyKcal: num(n["energy-kcal_100g"]),
    fat: num(n["fat_100g"]),
    saturatedFat: num(n["saturated-fat_100g"]),
    carbohydrates: num(n["carbohydrates_100g"]),
    sugars: num(n["sugars_100g"]),
    fiber: num(n["fiber_100g"]),
    protein: num(n["proteins_100g"]),
    salt: num(n["salt_100g"]),
  };
}

/* ---------- Ingredient and allergen suggestions ---------- */

const suggestionCache = new Map<string, Ingredient[]>();

const nameCache = new Map<string, string>();

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

async function fetchNames(
  tagtype: "ingredients" | "allergens",
  ids: string[],
  signal?: AbortSignal,
) {
  if (ids.length === 0) return;
  const url =
    `${TAXONOMY_URL}?tagtype=${tagtype}` +
    `&tags=${ids.map(encodeURIComponent).join(",")}` +
    `&fields=name&lc=sv,en`;
  const data = await getJson(url, signal);
  if (!data || typeof data !== "object") return;

  for (const id of ids) {
    const name = pickText((data as Record<string, any>)[id]?.name).trim();
    if (name) nameCache.set(id, capitalize(name));
  }
}

async function withSwedishNames(
  items: Ingredient[],
  signal?: AbortSignal,
): Promise<Ingredient[]> {
  const missing = items.map((i) => i.id).filter((id) => !nameCache.has(id));
  if (missing.length > 0) {
    try {
      // Ingredients first; whatever isn't found there is tried as an allergen.
      await fetchNames("ingredients", missing, signal);
      await fetchNames(
        "allergens",
        missing.filter((id) => !nameCache.has(id)),
        signal,
      );
    } catch (e) {
      if (signal?.aborted) throw e; // the search was cancelled: stop
      console.warn("Could not look up Swedish names", e);
    }
  }
  return items.map((i) => ({ ...i, name: nameCache.get(i.id) ?? i.name }));
}

async function searchIngredientsOnline(
  query: string,
  signal?: AbortSignal,
): Promise<Ingredient[]> {
  const q = query.trim();
  const key = q.toLowerCase();
  const cached = suggestionCache.get(key);
  if (cached) return cached;

  const url =
    `${SEARCH_BASE}/autocomplete?q=${encodeURIComponent(q)}` +
    `&taxonomy_names=allergen,ingredient&langs=sv,en&size=15`;
  const data = await getJson(url, signal);

  const seen = new Set<string>();
  const suggestions = (
    (data?.options ?? []) as Record<string, unknown>[]
  ).flatMap((o): Ingredient[] => {
    const id = String(o.id ?? "");
    const name = pickText(o.text) || pickText(o.name);
    if (!id || !name || seen.has(id)) return [];
    seen.add(id);
    return [{ id, name }];
  });

  const localized = await withSwedishNames(suggestions, signal);
  suggestionCache.set(key, localized);
  return localized;
}

export async function searchIngredients(
  query: string,
  signal?: AbortSignal,
): Promise<Ingredient[]> {
  try {
    return await searchTaxonomy(query, HEADERS);
  } catch (e) {
    if (signal?.aborted) throw e;
    console.warn("Local ingredient list unavailable, searching online", e);
    return searchIngredientsOnline(query, signal);
  }
}

export function prefetchIngredients() {
  ensureTaxonomy(HEADERS).catch(() => {});
}

/* ---------- Product search and details ---------- */

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
    `${SEARCH_BASE}/search?q=${encodeURIComponent(escapeLucene(q))}` +
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

  const ingredientsText = pickText(p.ingredients_text).trim();

  const details: ProductDetails = {
    code,
    name: pickText(p.product_name) || "Okänd produkt",
    brand: firstBrand(p.brands),
    imageUrl:
      pickText(p.image_front_url) ||
      pickText(p.image_front_small_url) ||
      undefined,
    contains: Array.from(
      new Set([...toTags(p.allergens_tags), ...toTags(p.ingredients_tags)]),
    ),
    traces: toTags(p.traces_tags),
    hasIngredients: ingredientsText.length > 0,
    ingredientsText: ingredientsText || undefined,
    description: pickText(p.generic_name).trim() || undefined,
    nutrition: toNutrition(p.nutriments),
  };
  detailsCache.set(code, details);
  return details;
}

export function uncheckable(
  restrictions: Restriction[],
  details: ProductDetails,
): string[] {
  return details.hasIngredients ? [] : restrictions.map((r) => r.id);
}
