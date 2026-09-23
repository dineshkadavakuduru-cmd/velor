import type { FavoriteItem, FavoritesStore } from "./types";

const STORAGE_KEY = "velor_favorites_v1";
const CURRENT_VERSION = 1;

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
  } catch {
    // storage full or unavailable — fail silently
  }
}

function hasItem(items: FavoriteItem[], id: string): boolean {
  return items.some((item) => item.id === id);
}

function toggleItem(items: FavoriteItem[], item: FavoriteItem): FavoriteItem[] {
  if (hasItem(items, item.id)) {
    return items.filter((existing) => existing.id !== item.id);
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

export function isFavorite(store: FavoritesStore, type: FavoriteItem["type"], id: string): boolean {
  const list = store[type === "team" ? "teams" : type === "league" ? "leagues" : "matches"];
  return hasItem(list, id);
}
