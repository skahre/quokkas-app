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

export type RestrictionList = {
  id: string;
  name: string;
  restrictions: string[];
};

type ProfileState = {
  name: string;
  restrictions: string[]; // the user's own
  lists: RestrictionList[]; // other saved lists
};

const INITIAL_STATE: ProfileState = { name: "", restrictions: [], lists: [] };

/* ---------- Reducer ---------- */

type Action =
  | { type: "hydrate"; state: ProfileState }
  | { type: "reset" }
  | { type: "name/set"; name: string }
  | { type: "mine/set"; items: string[] }
  | { type: "mine/toggle"; item: string }
  | { type: "list/create"; list: RestrictionList }
  | { type: "list/rename"; id: string; name: string }
  | { type: "list/delete"; id: string }
  | { type: "list/set"; id: string; items: string[] }
  | { type: "list/toggle"; id: string; item: string };

const toggleIn = (arr: string[], item: string) =>
  arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];

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
        restrictions: toggleIn(state.restrictions, action.item),
      };
    case "list/create":
      return { ...state, lists: [...state.lists, action.list] };
    case "list/rename":
      return {
        ...state,
        lists: state.lists.map((l) =>
          l.id === action.id ? { ...l, name: action.name } : l,
        ),
      };
    case "list/delete":
      return { ...state, lists: state.lists.filter((l) => l.id !== action.id) };
    case "list/set":
      return {
        ...state,
        lists: state.lists.map((l) =>
          l.id === action.id ? { ...l, restrictions: action.items } : l,
        ),
      };
    case "list/toggle":
      return {
        ...state,
        lists: state.lists.map((l) =>
          l.id === action.id
            ? { ...l, restrictions: toggleIn(l.restrictions, action.item) }
            : l,
        ),
      };
  }
}

/* ---------- Context ---------- */

type ProfileContextValue = ProfileState & {
  /** False until saved data has loaded from storage. */
  ready: boolean;

  setName: (name: string) => void;

  // The user's own restrictions
  hasRestriction: (item: string) => boolean;
  toggleRestriction: (item: string) => void;
  setRestrictions: (items: string[]) => void;

  // Other saved lists
  getList: (id: string) => RestrictionList | undefined;
  createList: (name: string, restrictions?: string[]) => string; // returns new id
  renameList: (id: string, name: string) => void;
  deleteList: (id: string) => void;
  setListRestrictions: (id: string, items: string[]) => void;
  toggleListRestriction: (id: string, item: string) => void;

  /** Clear everything (e.g. on log out). */
  reset: () => void;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

const newId = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const [ready, setReady] = useState(false);

  // Load once on startup. Merging with INITIAL_STATE means a missing field in
  // old saved data can't crash the app.
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          dispatch({
            type: "hydrate",
            state: { ...INITIAL_STATE, ...JSON.parse(saved) },
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
    (items: string[]) => dispatch({ type: "mine/set", items }),
    [],
  );
  const toggleRestriction = useCallback(
    (item: string) => dispatch({ type: "mine/toggle", item }),
    [],
  );
  const createList = useCallback(
    (name: string, restrictions: string[] = []) => {
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
    (id: string, items: string[]) => dispatch({ type: "list/set", id, items }),
    [],
  );
  const toggleListRestriction = useCallback(
    (id: string, item: string) => dispatch({ type: "list/toggle", id, item }),
    [],
  );
  const reset = useCallback(() => dispatch({ type: "reset" }), []);

  const value = useMemo<ProfileContextValue>(
    () => ({
      ...state,
      ready,
      setName,
      hasRestriction: (item) => state.restrictions.includes(item),
      toggleRestriction,
      setRestrictions,
      getList: (id) => state.lists.find((l) => l.id === id),
      createList,
      renameList,
      deleteList,
      setListRestrictions,
      toggleListRestriction,
      reset,
    }),
    [
      state,
      ready,
      setName,
      toggleRestriction,
      setRestrictions,
      createList,
      renameList,
      deleteList,
      setListRestrictions,
      toggleListRestriction,
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
