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

const STORAGE_KEY = "profile:v1";

/* ---------- Types ---------- */

/** "ok" = can eat it. It's a choice in the UI but is never stored: picking it
 *  removes the item from the list. */
export type Severity = "allergy" | "intolerance" | "ok";
export type StoredSeverity = Exclude<Severity, "ok">;

export type Restriction = { name: string; severity: StoredSeverity };

export type RestrictionList = {
  id: string;
  name: string; // e.g. "Alice Cohen", "Familjen"
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

/* ---------- Pure helpers ---------- */

const without = (items: Restriction[], name: string) =>
  items.filter((r) => r.name !== name);

/** Set an item's severity, adding it if missing. "ok" removes it. */
function withSeverity(
  items: Restriction[],
  name: string,
  severity: Severity,
): Restriction[] {
  if (severity === "ok") return without(items, name);
  return items.some((r) => r.name === name)
    ? items.map((r) => (r.name === name ? { ...r, severity } : r))
    : [...items, { name, severity }];
}

function toggled(items: Restriction[], name: string): Restriction[] {
  return items.some((r) => r.name === name)
    ? without(items, name)
    : [...items, { name, severity: DEFAULT_SEVERITY }];
}

/** Accepts old saved data (plain strings) as well as the current shape. */
function normalize(items: unknown): Restriction[] {
  if (!Array.isArray(items)) return [];
  return items.flatMap((x): Restriction[] => {
    if (typeof x === "string") return [{ name: x, severity: DEFAULT_SEVERITY }];
    if (x && typeof x.name === "string") {
      return [
        {
          name: x.name,
          severity: x.severity === "intolerance" ? "intolerance" : "allergy",
        },
      ];
    }
    return [];
  });
}

/* ---------- Reducer ---------- */

type Action =
  | { type: "hydrate"; state: ProfileState }
  | { type: "reset" }
  | { type: "name/set"; name: string }
  | { type: "mine/set"; items: Restriction[] }
  | { type: "mine/toggle"; name: string }
  | { type: "mine/severity"; name: string; severity: Severity }
  | { type: "list/create"; list: RestrictionList }
  | { type: "list/rename"; id: string; name: string }
  | { type: "list/delete"; id: string }
  | { type: "list/set"; id: string; items: Restriction[] }
  | { type: "list/toggle"; id: string; name: string }
  | { type: "list/severity"; id: string; name: string; severity: Severity };

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
        restrictions: toggled(state.restrictions, action.name),
      };
    case "mine/severity":
      return {
        ...state,
        restrictions: withSeverity(
          state.restrictions,
          action.name,
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
        restrictions: toggled(l.restrictions, action.name),
      }));
    case "list/severity":
      return mapList(state, action.id, (l) => ({
        ...l,
        restrictions: withSeverity(
          l.restrictions,
          action.name,
          action.severity,
        ),
      }));
  }
}

/* ---------- Context ---------- */

type ProfileContextValue = ProfileState & {
  /** False until saved data has loaded from storage. */
  ready: boolean;

  setName: (name: string) => void;

  // The user's own restrictions
  hasRestriction: (name: string) => boolean;
  /** The saved severity, or undefined if the item isn't a restriction. */
  getSeverity: (name: string) => StoredSeverity | undefined;
  /** Add with the default severity, or remove if already present. */
  toggleRestriction: (name: string) => void;
  /** Change severity; adds the item if missing; "ok" removes it. */
  setSeverity: (name: string, severity: Severity) => void;
  setRestrictions: (items: Restriction[]) => void;

  // Other saved lists
  getList: (id: string) => RestrictionList | undefined;
  createList: (name: string, restrictions?: Restriction[]) => string; // returns new id
  renameList: (id: string, name: string) => void;
  deleteList: (id: string) => void;
  setListRestrictions: (id: string, items: Restriction[]) => void;
  toggleListRestriction: (id: string, name: string) => void;
  setListSeverity: (id: string, name: string, severity: Severity) => void;

  /** Clear everything (e.g. on log out). */
  reset: () => void;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

const newId = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const [ready, setReady] = useState(false);

  // Load once on startup. Everything goes through normalize(), so data saved
  // by an older version of the app (plain strings) is upgraded automatically.
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

  // Save on every change, but only after the initial load, so the empty
  // starting state never overwrites what's stored.
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
    (name: string) => dispatch({ type: "mine/toggle", name }),
    [],
  );
  const setSeverity = useCallback(
    (name: string, severity: Severity) =>
      dispatch({ type: "mine/severity", name, severity }),
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
    (id: string, name: string) => dispatch({ type: "list/toggle", id, name }),
    [],
  );
  const setListSeverity = useCallback(
    (id: string, name: string, severity: Severity) =>
      dispatch({ type: "list/severity", id, name, severity }),
    [],
  );
  const reset = useCallback(() => dispatch({ type: "reset" }), []);

  const value = useMemo<ProfileContextValue>(
    () => ({
      ...state,
      ready,
      setName,
      hasRestriction: (name) => state.restrictions.some((r) => r.name === name),
      getSeverity: (name) =>
        state.restrictions.find((r) => r.name === name)?.severity,
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
