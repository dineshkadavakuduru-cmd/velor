import type { FavoriteItem, FavoritesStore } from "./types";

const STORAGE_KEY = "velor_favorites_v1";
const CURRENT_VERSION = 1;
const listeners = new Set<() => void>();

export function subscribeFavorites(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emitFavoritesChange() {
  listeners.forEach((listener) => listener());
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function createEmptyStore(): FavoritesStore {
  return {
    version: CURRENT_VERSION,
    teams: [],
    leagues: [],
    matches: [],
  };
}

export function loadFavorites(): FavoritesStore {
  if (!isBrowser()) {
    return createEmptyStore();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return createEmptyStore();
    }

    const parsed = JSON.parse(raw) as FavoritesStore;

    if (!parsed || typeof parsed !== "object" || parsed.version !== CURRENT_VERSION) {
      const fresh = createEmptyStore();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
      return fresh;
    }

    if (!Array.isArray(parsed.teams)) parsed.teams = [];
    if (!Array.isArray(parsed.leagues)) parsed.leagues = [];
    if (!Array.isArray(parsed.matches)) parsed.matches = [];

    return parsed;
  } catch {
    return createEmptyStore();
  }
}

export function saveFavorites(store: FavoritesStore): void {
  if (!isBrowser()) {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    emitFavoritesChange();
  } catch {
    // storage full or unavailable — fail silently
  }
}

function getCompositeKey(item: FavoriteItem): string {
  const sportId = item.sportId ?? "all";
  return `${item.type}:${sportId}:${item.id}`;
}

function hasItem(items: FavoriteItem[], item: FavoriteItem): boolean {
  const targetKey = getCompositeKey(item);
  return items.some((existing) => getCompositeKey(existing) === targetKey);
}

function toggleItem(items: FavoriteItem[], item: FavoriteItem): FavoriteItem[] {
  if (hasItem(items, item)) {
    const targetKey = getCompositeKey(item);
    return items.filter((existing) => getCompositeKey(existing) !== targetKey);
  }
  return [...items, item];
}

export function toggleFavorite(store: FavoritesStore, item: FavoriteItem): FavoritesStore {
  const updated = { ...store };

  switch (item.type) {
    case "team":
      updated.teams = toggleItem(store.teams, item);
      break;
    case "league":
      updated.leagues = toggleItem(store.leagues, item);
      break;
    case "match":
      updated.matches = toggleItem(store.matches, item);
      break;
  }

  updated.version = CURRENT_VERSION;
  return updated;
}

export function isFavorite(
  store: FavoritesStore,
  item: Pick<FavoriteItem, "type" | "id" | "sportId">
): boolean {
  const list = store[item.type === "team" ? "teams" : item.type === "league" ? "leagues" : "matches"];
  return list.some((existing) => {
    const targetKey = `${existing.type}:${existing.sportId ?? "all"}:${existing.id}`;
    const itemKey = `${item.type}:${item.sportId ?? "all"}:${item.id}`;
    return targetKey === itemKey;
  });
}
