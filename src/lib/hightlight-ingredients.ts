import type { Restriction } from "@/context/profile-context";
import { normalize, ownKeysFor, relatedKeysFor } from "./taxonomy";

const SHELLFISH = [
  "skaldjur",
  "räk",
  "krabb",
  "hummer",
  "kräft",
  "mussl",
  "ostron",
  "bläckfisk",
  "krill",
  "shrimp",
  "prawn",
  "crab",
  "lobster",
  "crustacean",
  "mollus",
  "crevette",
  "garnele",
  "gambas",
];
const MILK = [
  "mjölk",
  "grädde",
  "smör",
  "ost",
  "vassle",
  "kasein",
  "laktos",
  "milk",
  "cream",
  "butter",
  "whey",
  "casein",
  "lactose",
  "yoghurt",
  "yogurt",
  "lait",
  "milch",
  "leche",
  "latte",
  "melk",
  "maito",
  "mælk",
  "melkeprotein",
];

const KEYWORDS: Record<string, string[]> = {
  "en:gluten": [
    "gluten",
    "vete",
    "råg",
    "korn",
    "havre",
    "dinkel",
    "spelt",
    "kamut",
    "durum",
    "semolina",
    "wheat",
    "rye",
    "barley",
    "oat",
    "weizen",
    "roggen",
    "gerste",
    "hafer",
    "blé",
    "seigle",
    "orge",
    "avoine",
    "trigo",
    "centeno",
    "cebada",
    "avena",
    "frumento",
    "grano",
  ],
  "en:crustaceans": SHELLFISH,
  "en:molluscs": SHELLFISH,
  "en:eggs": [
    "ägg",
    "egg",
    "ei",
    "oeuf",
    "œuf",
    "huevo",
    "uovo",
    "uova",
    "muna",
    "æg",
  ],
  "en:fish": [
    "fisk",
    "lax",
    "torsk",
    "sill",
    "tonfisk",
    "makrill",
    "ansjovis",
    "fish",
    "salmon",
    "tuna",
    "anchov",
    "poisson",
    "fisch",
    "pescado",
    "pesce",
    "kala",
  ],
  "en:peanuts": [
    "jordnöt",
    "peanut",
    "arachide",
    "erdnuss",
    "cacahuete",
    "maapähkinä",
  ],
  "en:soybeans": ["soja", "soy", "soia", "sojapapu"],
  "en:milk": MILK,
  "en:nuts": [
    "nötter",
    "hasselnöt",
    "valnöt",
    "paranöt",
    "mandel",
    "cashew",
    "pekan",
    "pistage",
    "macadamia",
    "almond",
    "hazelnut",
    "walnut",
    "pistachio",
    "pecan",
    "tree nut",
    "noisette",
    "amande",
    "haselnuss",
    "walnuss",
    "avellana",
    "almendra",
    "nocciola",
    "mandorla",
    "pähkinä",
  ],
  "en:celery": ["selleri", "celery", "céleri", "sellerie", "apio", "sedano"],
  "en:mustard": [
    "senap",
    "mustard",
    "moutarde",
    "senf",
    "mostaza",
    "senape",
    "sinappi",
  ],
  "en:sesame-seeds": ["sesam"],
  "en:sulphur-dioxide-and-sulphites": [
    "sulfit",
    "sulphite",
    "sulfite",
    "svaveldioxid",
    "sulphur",
  ],
  "en:lupin": ["lupin"],
};

const WORD = /[a-z0-9]/;

function containsWord(text: string, kw: string): boolean {
  if (kw.length > 3) return text.includes(kw);
  let i = text.indexOf(kw);
  while (i !== -1) {
    if (i === 0 || !WORD.test(text[i - 1])) return true;
    i = text.indexOf(kw, i + 1);
  }
  return false;
}

type Matcher = {
  anywhere: string[];
  atStart: string[];
  severity: Restriction["severity"];
};

function matcherFor(r: Restriction, names: Record<string, string[]>): Matcher {
  const anywhere = new Set<string>();
  const add = (word: string) => {
    const n = normalize(word);
    if (n.length >= 3) anywhere.add(n);
  };

  add(r.name);
  (KEYWORDS[r.id] ?? []).forEach(add);
  (names[r.id] ?? []).forEach(add);
  ownKeysFor(r.id).forEach(add);

  const atStart = new Set<string>();
  for (const key of relatedKeysFor(r.id)) {
    if (key.length >= 4 && !anywhere.has(key)) atStart.add(key);
  }

  return {
    anywhere: Array.from(anywhere),
    atStart: Array.from(atStart),
    severity: r.severity,
  };
}

export type IngredientPart = {
  text: string;
  bold: boolean;
  muted: boolean;
};

export type IngredientItem = {
  lead: string;
  parts: IngredientPart[];
  severity?: Restriction["severity"];
};

function splitTopLevel(text: string): string[] {
  const items: string[] = [];
  let depth = 0;
  let current = "";
  for (const ch of text) {
    if (ch === "(" || ch === "[") depth++;
    if (ch === ")" || ch === "]") depth = Math.max(0, depth - 1);
    current += ch;
    if ((ch === "," || ch === ";") && depth === 0) {
      items.push(current);
      current = "";
    }
  }
  if (current) items.push(current);
  return items;
}

function toParts(item: string): IngredientPart[] {
  const parts: IngredientPart[] = [];
  let bold = false;
  let depth = 0;
  let buffer = "";

  const flush = (b: boolean, m: boolean) => {
    if (buffer) parts.push({ text: buffer, bold: b, muted: m });
    buffer = "";
  };

  for (const ch of item) {
    if (ch === "_") {
      flush(bold, depth > 0);
      bold = !bold;
      continue;
    }
    if (ch === "(" || ch === "[") {
      flush(bold, depth > 0);
      depth++;
    }
    buffer += ch;
    if (ch === ")" || ch === "]") {
      flush(bold, depth > 0);
      depth = Math.max(0, depth - 1);
    }
  }
  flush(bold, depth > 0);
  return parts;
}

export function parseIngredients(
  text: string,
  restrictions: Restriction[],
  names: Record<string, string[]> = {},
): IngredientItem[] {
  const matchers = restrictions.map((r) => matcherFor(r, names));

  return splitTopLevel(text).map((raw) => {
    const lead = raw.match(/^\s*/)?.[0] ?? "";
    const body = raw.slice(lead.length);

    const folded = normalize(body.replace(/_/g, ""));
    const head = folded.split("(")[0].trim();

    let severity: IngredientItem["severity"];
    for (const m of matchers) {
      const hit =
        m.anywhere.some((w) => containsWord(folded, w)) ||
        m.atStart.some((w) => head.startsWith(w));
      if (hit) {
        severity = m.severity;
        if (severity === "allergy") break;
      }
    }
    return { lead, parts: toParts(body), severity };
  });
}
