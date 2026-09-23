"use client";

import { useSyncExternalStore } from "react";
import { loadFavorites, saveFavorites, toggleFavorite } from "./storage";
import type { FavoriteItem, FavoritesStore } from "./types";

const EMPTY_STORE: FavoritesStore = {
  version: 1,
  teams: [],
  leagues: [],
  matches: [],
};

let snapshot = EMPTY_STORE;
let initialized = false;
const listeners = new Set<() => void>();

function initialize() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  snapshot = loadFavorites();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  initialize();
  const onStorage = (event: StorageEvent) => {
    if (event.key === "velor_favorites_v1") {
      snapshot = loadFavorites();
      listeners.forEach((currentListener) => currentListener());
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot() {
  return snapshot;
}

function getServerSnapshot() {
  return EMPTY_STORE;
}

export function useFavorites() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function toggleFavoriteItem(item: FavoriteItem) {
  initialize();
  snapshot = toggleFavorite(snapshot, item);
  saveFavorites(snapshot);
  listeners.forEach((listener) => listener());
}
