"use client";

import { useState, useEffect, useCallback, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Clock, Users, Trophy, Calendar, User } from "lucide-react";
import type { SearchResult } from "@/lib/types/sports";

const RECENT_QUERIES_KEY = "velor_recent_searches";
const MAX_RECENT = 5;

const iconMap: Record<SearchResult["type"], React.ComponentType<{ className?: string }>> = {
  team: Users,
  league: Trophy,
  match: Calendar,
  player: User,
};

export default function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentQueries, setRecentQueries] = useState<string[]>([]);
  const [isSearching, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem(RECENT_QUERIES_KEY);
    if (stored) {
      try {
        setRecentQueries(JSON.parse(stored));
      } catch {
        setRecentQueries([]);
      }
    }
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
    }
  }, [open]);

  const saveRecentQuery = useCallback((q: string) => {
    const stored = q.trim();
    if (!stored) return;
    setRecentQueries((prev) => {
      const updated = [stored, ...prev.filter((r) => r !== stored)].slice(0, MAX_RECENT);
      localStorage.setItem(RECENT_QUERIES_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const performSearch = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (res.ok) {
          const data = await res.json();
          setResults(data.results ?? []);
        }
      } catch {
        setResults([]);
      }
    });
  }, []);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    performSearch(value);
  }, [performSearch]);

  const handleSelect = (result: SearchResult) => {
    saveRecentQuery(result.name);
    router.push(result.href);
    setOpen(false);
    setQuery("");
    setResults([]);
  };

  const handleRecentClick = (q: string) => {
    setQuery(q);
    performSearch(q);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-mono tracking-widest text-text-secondary hover:text-text-primary hover:border-live border border-border-subtle hover:bg-surface-1 transition-all"
        aria-label="Open command palette"
      >
        <Search className="w-3 h-3" />
        <span>SEARCH</span>
        <span className="text-text-secondary">·</span>
        <kbd className="px-1.5 py-0.5 text-xs text-text-secondary bg-surface-2/50 rounded">⌘K</kbd>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-modal="true"
            role="dialog"
          />

          <div
            className="fixed inset-0 z-50 flex items-start justify-center pt-[8rem] px-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full max-w-2xl bg-surface-1 border border-border-subtle shadow-2xl">
              <div className="px-4 py-3 border-b border-border-subtle">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search teams, leagues, matches..."
                  value={query}
                  onChange={handleSearch}
                  className="w-full text-lg focus:outline-none bg-transparent text-text-primary placeholder-text-secondary font-mono"
                />
              </div>

              <div className="max-h-[400px] overflow-y-auto">
                {query.trim().length === 0 && recentQueries.length > 0 && (
                  <div className="pb-2">
                    <div className="px-4 py-1.5 text-xs font-mono text-text-secondary tracking-widest">
                      RECENT SEARCHES
                    </div>
                    {recentQueries.map((rq) => (
                      <button
                        key={rq}
                        onClick={() => handleRecentClick(rq)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-mono text-text-secondary hover:text-text-primary hover:bg-surface-2/30 transition-colors"
                      >
                        <Clock className="w-3 h-3" />
                        {rq}
                      </button>
                    ))}
                  </div>
                )}

                {query.trim().length > 0 && results.length === 0 && !isSearching && (
                  <div className="px-4 py-3 font-mono text-xs text-text-secondary">
                    NO RESULTS FOUND
                  </div>
                )}

                {results.length > 0 && (
                  <div className="pb-2">
                    {results.map((result) => {
                      const Icon = iconMap[result.type] ?? Search;
                      return (
                        <button
                          key={`${result.type}:${result.id}:${result.href}`}
                          onClick={() => handleSelect(result)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 font-mono text-xs text-left cursor-pointer hover:bg-surface-2/30 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            {result.logo ? (
                              <img
                                src={result.logo}
                                alt={result.name}
                                className="w-6 h-6 object-contain"
                              />
                            ) : (
                              <Icon className="w-4 h-4 text-text-secondary" />
                            )}
                            <div className="flex flex-col">
                              <span className="text-text-primary">{result.name}</span>
                              {result.subtitle && (
                                <span className="text-text-secondary">{result.subtitle}</span>
                              )}
                            </div>
                          </div>
                          <span className="ml-auto text-[10px] font-mono text-text-secondary uppercase">
                            {result.type}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="px-4 py-2 border-t border-border-subtle flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-mono text-text-secondary">
                  <kbd className="px-1.5 py-0.5 bg-surface-2/50 rounded">↑↓</kbd>
                  <span>navigate</span>
                  <kbd className="px-1.5 py-0.5 bg-surface-2/50 rounded">↵</kbd>
                  <span>select</span>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="p-1 text-text-secondary hover:text-text-primary transition-colors"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
