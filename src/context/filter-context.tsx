import type { Restriction, RestrictionList } from "@/context/profile-context";
import { useProfile } from "@/context/profile-context";
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

const MINE_ID = "mine";
const DEFAULT_FILTERS = [MINE_ID];

type FilterContextValue = {
  filterOptions: RestrictionList[];
  filters: string[];
  setFilters: (ids: string[]) => void;
  resetFilters: () => void;
  activeRestrictions: Restriction[];
};

const FilterContext = createContext<FilterContextValue | null>(null);

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const { restrictions, lists } = useProfile();
  const [selected, setSelected] = useState<string[]>(DEFAULT_FILTERS);

  const filterOptions = useMemo<RestrictionList[]>(
    () => [
      { id: MINE_ID, name: "Mina restriktioner", restrictions },
      ...lists.filter((list) => list.id !== MINE_ID),
    ],
    [restrictions, lists],
  );

  const filters = useMemo(
    () => selected.filter((id) => filterOptions.some((o) => o.id === id)),
    [selected, filterOptions],
  );

  const activeRestrictions = useMemo(() => {
    const byId = new Map<string, Restriction>();
    for (const list of filterOptions) {
      if (!filters.includes(list.id)) continue;
      for (const r of list.restrictions) {
        const existing = byId.get(r.id);
        if (!existing || r.severity === "allergy") byId.set(r.id, r);
      }
    }
    return Array.from(byId.values());
  }, [filterOptions, filters]);

  const resetFilters = useCallback(() => setSelected(DEFAULT_FILTERS), []);

  const value = useMemo<FilterContextValue>(
    () => ({
      filterOptions,
      filters,
      setFilters: setSelected,
      resetFilters,
      activeRestrictions,
    }),
    [filterOptions, filters, resetFilters, activeRestrictions],
  );

  return (
    <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
  );
}

export function useFilters() {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error("useFilters must be used inside <FilterProvider>");
  return ctx;
}
