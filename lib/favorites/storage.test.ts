import { describe, it } from "node:test";
import assert from "node:assert";
import {
  loadFavorites,
  toggleFavorite,
  isFavorite,
} from "./storage";
import type { FavoritesStore, FavoriteItem } from "./types";

const localStorageKey = "velor_favorites_v1";

function createMockLocalStorage(): typeof globalThis.localStorage {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, value),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear(),
    get length() {
      return store.size;
    },
    key: (index: number) => {
      const keys = Array.from(store.keys());
      return keys[index] ?? null;
    },
  } as unknown as typeof globalThis.localStorage;
}

function withMockLocalStorage(data: unknown, fn: () => void) {
  const mockStorage = createMockLocalStorage();
  const originalWindow = globalThis.window;
  const originalLocalStorage = globalThis.localStorage;

  globalThis.window = { ...(originalWindow as unknown as Record<string, unknown>), localStorage: mockStorage } as unknown as Window & typeof globalThis;
  globalThis.localStorage = mockStorage;

  if (data !== null && data !== undefined) {
    mockStorage.setItem(localStorageKey, JSON.stringify(data));
  }

  try {
    fn();
  } finally {
    globalThis.window = originalWindow;
    globalThis.localStorage = originalLocalStorage;
  }
}

describe("favorites storage", () => {
  it("returns empty store when localStorage is empty", () => {
    withMockLocalStorage(null, () => {
      const store = loadFavorites();
      assert.deepStrictEqual(store, {
        version: 1,
        teams: [],
        leagues: [],
        matches: [],
      });
    });
  });

  it("loads existing valid store", () => {
    const existing: FavoritesStore = {
      version: 1,
      teams: [{ id: "t1", type: "team", name: "Arsenal", logo: "/logos/arsenal.png" }],
      leagues: [],
      matches: [],
    };
    withMockLocalStorage(existing, () => {
      const store = loadFavorites();
      assert.deepStrictEqual(store.teams, existing.teams);
    });
  });

  it("resets store when version mismatches", () => {
    withMockLocalStorage({ version: 99, teams: [], leagues: [], matches: [] }, () => {
      const store = loadFavorites();
      assert.strictEqual(store.version, 1);
      assert.deepStrictEqual(store.teams, []);
    });
  });

  it("resets store when data is corrupted", () => {
    withMockLocalStorage("not-json", () => {
      const store = loadFavorites();
      assert.deepStrictEqual(store.teams, []);
      assert.deepStrictEqual(store.leagues, []);
      assert.deepStrictEqual(store.matches, []);
    });
  });

  it("normalizes missing arrays", () => {
    withMockLocalStorage({ version: 1 }, () => {
      const store = loadFavorites();
      assert.ok(Array.isArray(store.teams));
      assert.ok(Array.isArray(store.leagues));
      assert.ok(Array.isArray(store.matches));
    });
  });
});

describe("toggleFavorite", () => {
  it("adds a new favorite team", () => {
    const store: FavoritesStore = { version: 1, teams: [], leagues: [], matches: [] };
    const item: FavoriteItem = { id: "t1", type: "team", name: "Arsenal" };
    const updated = toggleFavorite(store, item);
    assert.strictEqual(updated.teams.length, 1);
    assert.strictEqual(updated.teams[0].id, "t1");
  });

  it("removes an existing favorite team", () => {
    const store: FavoritesStore = {
      version: 1,
      teams: [{ id: "t1", type: "team", name: "Arsenal" }],
      leagues: [],
      matches: [],
    };
    const item: FavoriteItem = { id: "t1", type: "team", name: "Arsenal" };
    const updated = toggleFavorite(store, item);
    assert.strictEqual(updated.teams.length, 0);
  });

  it("does not affect other types when toggling a team", () => {
    const store: FavoritesStore = {
      version: 1,
      teams: [],
      leagues: [{ id: "l1", type: "league", name: "Premier League" }],
      matches: [],
    };
    const item: FavoriteItem = { id: "t1", type: "team", name: "Arsenal" };
    const updated = toggleFavorite(store, item);
    assert.strictEqual(updated.teams.length, 1);
    assert.strictEqual(updated.leagues.length, 1);
  });

  it("preserves version on toggle", () => {
    const store: FavoritesStore = { version: 1, teams: [], leagues: [], matches: [] };
    const item: FavoriteItem = { id: "t1", type: "team", name: "Arsenal" };
    const updated = toggleFavorite(store, item);
    assert.strictEqual(updated.version, 1);
  });
});

describe("isFavorite", () => {
  it("returns true for existing favorite", () => {
    const store: FavoritesStore = {
      version: 1,
      teams: [{ id: "t1", type: "team", name: "Arsenal" }],
      leagues: [],
      matches: [],
    };
    assert.strictEqual(isFavorite(store, "team", "t1"), true);
  });

  it("returns false for missing favorite", () => {
    const store: FavoritesStore = { version: 1, teams: [], leagues: [], matches: [] };
    assert.strictEqual(isFavorite(store, "team", "t1"), false);
  });

  it("checks league favorites", () => {
    const store: FavoritesStore = {
      version: 1,
      teams: [],
      leagues: [{ id: "l1", type: "league", name: "Premier League" }],
      matches: [],
    };
    assert.strictEqual(isFavorite(store, "league", "l1"), true);
    assert.strictEqual(isFavorite(store, "league", "l2"), false);
  });

  it("checks match favorites", () => {
    const store: FavoritesStore = {
      version: 1,
      teams: [],
      leagues: [],
      matches: [{ id: "m1", type: "match", name: "Arsenal vs Chelsea" }],
    };
    assert.strictEqual(isFavorite(store, "match", "m1"), true);
    assert.strictEqual(isFavorite(store, "match", "m2"), false);
  });
});
