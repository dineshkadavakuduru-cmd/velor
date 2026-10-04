"use client";

import { useCallback } from "react";
import { Heart } from "lucide-react";
import type { FavoriteItem } from "@/lib/favorites/types";
import { toggleFavoriteItem, useFavorites } from "@/lib/favorites/client-store";
import { isFavorite } from "@/lib/favorites/storage";

interface FavoriteButtonProps {
  item: FavoriteItem;
  onToggle?: (item: FavoriteItem, active: boolean) => void;
}

export default function FavoriteButton({ item, onToggle }: FavoriteButtonProps) {
  const favorites = useFavorites();
  const active = isFavorite(favorites, item);

  const handleClick = useCallback(() => {
    const nextActive = !isFavorite(favorites, item);
    toggleFavoriteItem(item);
    onToggle?.(item, nextActive);
  }, [favorites, item, onToggle]);

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        handleClick();
      }}
      aria-pressed={active}
      aria-label={active ? `Remove ${item.name} from favorites` : `Add ${item.name} to favorites`}
      className={`
        inline-flex items-center justify-center h-8 w-8
        border transition-colors
        ${active
          ? "border-gold text-gold bg-gold/10"
          : "border-border-default text-text-secondary hover:text-gold hover:border-gold/50"
        }
      `}
    >
      <Heart className={`h-4 w-4 ${active ? "fill-current" : ""}`} />
    </button>
  );
}
