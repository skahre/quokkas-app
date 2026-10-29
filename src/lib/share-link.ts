import type { Restriction } from "@/context/profile-context";
import * as Linking from "expo-linking";

const MAX_ITEMS = 100;
const MAX_TEXT = 80;

type Wire = [string, string, "a" | "i"];

export function buildShareUrl(name: string, restrictions: Restriction[]) {
  const data: Wire[] = restrictions.map((r) => [
    r.id,
    r.name,
    r.severity === "allergy" ? "a" : "i",
  ]);
  return Linking.createURL("import", {
    queryParams: { n: name, d: JSON.stringify(data) },
  });
}

export function parseShared(raw?: string): Restriction[] | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;

    const seen = new Set<string>();
    const items: Restriction[] = [];
    for (const row of parsed.slice(0, MAX_ITEMS)) {
      if (!Array.isArray(row)) continue;
      const [id, name, sev] = row;
      if (typeof id !== "string" || typeof name !== "string") continue;
      if (!id || !name || seen.has(id)) continue;
      seen.add(id);
      items.push({
        id: id.slice(0, MAX_TEXT),
        name: name.slice(0, MAX_TEXT),
        severity: sev === "i" ? "intolerance" : "allergy",
      });
    }
    return items.length > 0 ? items : null;
  } catch {
    return null;
  }
}

export function parseShareLink(
  text: string,
): { sender: string; items: Restriction[] } | null {
  const match = text.match(/\S+:\/\/\S+/);
  if (!match) return null;
  try {
    const { queryParams } = Linking.parse(match[0]);
    const d = queryParams?.d;
    const n = queryParams?.n;
    const items = parseShared(typeof d === "string" ? d : undefined);
    if (!items) return null;
    return { sender: typeof n === "string" ? n.trim() : "", items };
  } catch {
    return null;
  }
}
