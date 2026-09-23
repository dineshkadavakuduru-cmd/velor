export interface FavoriteItem {
  id: string;
  type: "team" | "league" | "match";
  name: string;
  logo?: string;
  subtitle?: string;
  sportId?: string;
}

export interface FavoritesStore {
  version: number;
  teams: FavoriteItem[];
  leagues: FavoriteItem[];
  matches: FavoriteItem[];
}

export const FAVORITES_STORAGE_KEY = "velor_favorites_v1";

export const CURRENT_VERSION = 1;
