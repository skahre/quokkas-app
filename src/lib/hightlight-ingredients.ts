import type { Restriction } from "@/context/profile-context";

const KEYWORDS: Record<string, string[]> = {
  Gluten: [
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
  ],
  Skaldjur: [
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
    "crab",
    "lobster",
    "crustacean",
    "mollus",
  ],
  Ägg: ["ägg", "egg"],
  Fisk: [
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
  ],
  Jordnötter: ["jordnöt", "peanut"],
  Sojabönor: ["soja", "soy"],
  Mjölk: [
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
  ],
  Laktos: [
    "laktos",
    "lactose",
    "mjölk",
    "grädde",
    "vassle",
    "milk",
    "cream",
    "whey",
    "yoghurt",
    "yogurt",
  ],
  Nötter: [
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
  ],
  Selleri: ["selleri", "celery"],
  Senap: ["senap", "mustard"],
  Sesamfrön: ["sesam"],
  Sulfiter: ["sulfit", "sulphite", "sulfite", "svaveldioxid", "sulphur"],
  Lupin: ["lupin"],
  Lök: ["lök", "onion", "shallot"],
};

const LETTER = /[a-zåäöé]/;

function hasKeyword(textLower: string, kw: string): boolean {
  if (kw.length > 3) return textLower.includes(kw);
  let i = textLower.indexOf(kw);
  while (i !== -1) {
    if (i === 0 || !LETTER.test(textLower[i - 1])) return true;
    i = textLower.indexOf(kw, i + 1);
  }
  return false;
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
): IngredientItem[] {
  return splitTopLevel(text).map((raw) => {
    const lead = raw.match(/^\s*/)?.[0] ?? "";
    const body = raw.slice(lead.length);
    const lower = body.replace(/_/g, "").toLowerCase();

    let severity: IngredientItem["severity"];
    for (const r of restrictions) {
      const words = KEYWORDS[r.name] ?? [r.name.toLowerCase()];
      if (words.some((w) => hasKeyword(lower, w))) {
        severity = r.severity;
        if (severity === "allergy") break;
      }
    }
    return { lead, parts: toParts(body), severity };
  });
}
