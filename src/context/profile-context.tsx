import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";

const STORAGE_KEY = "profile:v2";

/* ---------- Types ---------- */

export type Ingredient = { id: string; name: string };

export type Severity = "allergy" | "intolerance" | "ok";
export type StoredSeverity = Exclude<Severity, "ok">;

export type Restriction = Ingredient & { severity: StoredSeverity };

export type RestrictionList = {
  id: string;
  name: string;
  restrictions: Restriction[];
};

type ProfileState = {
  name: string;
  restrictions: Restriction[]; // the user's own
  lists: RestrictionList[]; // other saved lists
};

const INITIAL_STATE: ProfileState = { name: "", restrictions: [], lists: [] };

// What a newly added restriction (e.g. from the onboarding chips) starts as.
const DEFAULT_SEVERITY: StoredSeverity = "allergy";

/* ---------- Pure helpers (items are identified by id) ---------- */

const without = (items: Restriction[], id: string) =>
  items.filter((r) => r.id !== id);

/** Set an item's severity, adding it if missing. "ok" removes it. */
function withSeverity(
  items: Restriction[],
  item: Ingredient,
  severity: Severity,
): Restriction[] {
  if (severity === "ok") return without(items, item.id);
  return items.some((r) => r.id === item.id)
    ? items.map((r) => (r.id === item.id ? { ...r, severity } : r))
    : [...items, { id: item.id, name: item.name, severity }];
}

function toggled(items: Restriction[], item: Ingredient): Restriction[] {
  return items.some((r) => r.id === item.id)
    ? without(items, item.id)
    : [...items, { id: item.id, name: item.name, severity: DEFAULT_SEVERITY }];
}

/** Keeps only well-formed entries, so bad saved data can't crash the app. */
function normalize(items: unknown): Restriction[] {
  if (!Array.isArray(items)) return [];
  return items.flatMap((x): Restriction[] =>
    x && typeof x.id === "string" && typeof x.name === "string"
      ? [
          {
            id: x.id,
            name: x.name,
            severity: x.severity === "intolerance" ? "intolerance" : "allergy",
          },
        ]
      : [],
  );
}

/* ---------- Reducer ---------- */

type Action =
  | { type: "hydrate"; state: ProfileState }
  | { type: "reset" }
  | { type: "name/set"; name: string }
  | { type: "mine/set"; items: Restriction[] }
  | { type: "mine/toggle"; item: Ingredient }
  | { type: "mine/severity"; item: Ingredient; severity: Severity }
  | { type: "list/create"; list: RestrictionList }
  | { type: "list/rename"; id: string; name: string }
  | { type: "list/delete"; id: string }
  | { type: "list/set"; id: string; items: Restriction[] }
  | { type: "list/toggle"; id: string; item: Ingredient }
  | { type: "list/severity"; id: string; item: Ingredient; severity: Severity };

const mapList = (
  state: ProfileState,
  id: string,
  fn: (l: RestrictionList) => RestrictionList,
): ProfileState => ({
  ...state,
  lists: state.lists.map((l) => (l.id === id ? fn(l) : l)),
});

function reducer(state: ProfileState, action: Action): ProfileState {
  switch (action.type) {
    case "hydrate":
      return action.state;
    case "reset":
      return INITIAL_STATE;
    case "name/set":
      return { ...state, name: action.name };
    case "mine/set":
      return { ...state, restrictions: action.items };
    case "mine/toggle":
      return {
        ...state,
        restrictions: toggled(state.restrictions, action.item),
      };
    case "mine/severity":
      return {
        ...state,
        restrictions: withSeverity(
          state.restrictions,
          action.item,
          action.severity,
        ),
      };
    case "list/create":
      return { ...state, lists: [...state.lists, action.list] };
    case "list/rename":
      return mapList(state, action.id, (l) => ({ ...l, name: action.name }));
    case "list/delete":
      return { ...state, lists: state.lists.filter((l) => l.id !== action.id) };
    case "list/set":
      return mapList(state, action.id, (l) => ({
        ...l,
        restrictions: action.items,
      }));
    case "list/toggle":
      return mapList(state, action.id, (l) => ({
        ...l,
        restrictions: toggled(l.restrictions, action.item),
      }));
    case "list/severity":
      return mapList(state, action.id, (l) => ({
        ...l,
        restrictions: withSeverity(
          l.restrictions,
          action.item,
          action.severity,
        ),
      }));
  }
}

/* ---------- Context ---------- */

type ProfileContextValue = ProfileState & {
  ready: boolean;

  setName: (name: string) => void;

  // The user's own restrictions
  hasRestriction: (id: string) => boolean;
  getSeverity: (id: string) => StoredSeverity | undefined;
  toggleRestriction: (item: Ingredient) => void;
  setSeverity: (item: Ingredient, severity: Severity) => void;
  setRestrictions: (items: Restriction[]) => void;

  getList: (id: string) => RestrictionList | undefined;
  createList: (name: string, restrictions?: Restriction[]) => string; // returns new id
  renameList: (id: string, name: string) => void;
  deleteList: (id: string) => void;
  setListRestrictions: (id: string, items: Restriction[]) => void;
  toggleListRestriction: (listId: string, item: Ingredient) => void;
  setListSeverity: (
    listId: string,
    item: Ingredient,
    severity: Severity,
  ) => void;

  reset: () => void;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

const newId = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          dispatch({
            type: "hydrate",
            state: {
              name: typeof parsed.name === "string" ? parsed.name : "",
              restrictions: normalize(parsed.restrictions),
              lists: Array.isArray(parsed.lists)
                ? parsed.lists.map((l: any) => ({
                    id: String(l.id),
                    name: String(l.name ?? ""),
                    restrictions: normalize(l.restrictions),
                  }))
                : [],
            },
          });
        }
      } catch (e) {
        console.warn("Could not load profile", e);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch((e) =>
      console.warn("Could not save profile", e),
    );
  }, [state, ready]);

  const setName = useCallback(
    (name: string) => dispatch({ type: "name/set", name }),
    [],
  );
  const setRestrictions = useCallback(
    (items: Restriction[]) => dispatch({ type: "mine/set", items }),
    [],
  );
  const toggleRestriction = useCallback(
    (item: Ingredient) => dispatch({ type: "mine/toggle", item }),
    [],
  );
  const setSeverity = useCallback(
    (item: Ingredient, severity: Severity) =>
      dispatch({ type: "mine/severity", item, severity }),
    [],
  );
  const createList = useCallback(
    (name: string, restrictions: Restriction[] = []) => {
      const id = newId();
      dispatch({ type: "list/create", list: { id, name, restrictions } });
      return id;
    },
    [],
  );
  const renameList = useCallback(
    (id: string, name: string) => dispatch({ type: "list/rename", id, name }),
    [],
  );
  const deleteList = useCallback(
    (id: string) => dispatch({ type: "list/delete", id }),
    [],
  );
  const setListRestrictions = useCallback(
    (id: string, items: Restriction[]) =>
      dispatch({ type: "list/set", id, items }),
    [],
  );
  const toggleListRestriction = useCallback(
    (id: string, item: Ingredient) =>
      dispatch({ type: "list/toggle", id, item }),
    [],
  );
  const setListSeverity = useCallback(
    (id: string, item: Ingredient, severity: Severity) =>
      dispatch({ type: "list/severity", id, item, severity }),
    [],
  );
  const reset = useCallback(() => dispatch({ type: "reset" }), []);

  const value = useMemo<ProfileContextValue>(
    () => ({
      ...state,
      ready,
      setName,
      hasRestriction: (id) => state.restrictions.some((r) => r.id === id),
      getSeverity: (id) =>
        state.restrictions.find((r) => r.id === id)?.severity,
      toggleRestriction,
      setSeverity,
      setRestrictions,
      getList: (id) => state.lists.find((l) => l.id === id),
      createList,
      renameList,
      deleteList,
      setListRestrictions,
      toggleListRestriction,
      setListSeverity,
      reset,
    }),
    [
      state,
      ready,
      setName,
      toggleRestriction,
      setSeverity,
      setRestrictions,
      createList,
      renameList,
      deleteList,
      setListRestrictions,
      toggleListRestriction,
      setListSeverity,
      reset,
    ],
  );

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used inside <ProfileProvider>");
  return ctx;
}
