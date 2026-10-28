"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Clock, Users, Trophy, Calendar, User, Globe } from "lucide-react";
import { getEnabledSports } from "@/lib/api/sports";
import { MIN_SEARCH_QUERY_LENGTH } from "@/lib/api/search-response";
import type { SearchResult } from "@/lib/types/sports";

const RECENT_QUERIES_KEY = "velor_recent_searches";
const MAX_RECENT = 5;
const SEARCH_DEBOUNCE_MS = 250;

/** Targets /api/search actually resolves — stated in the palette so the
 * search scope is never a guess. */
const SEARCH_TARGETS = ["teams", "players", "leagues", "matches", "sports"];
const COVERED_SPORTS = getEnabledSports().map((sport) => sport.name);

type SearchStatus = "idle" | "searching" | "results" | "empty" | "error";

interface SearchUnavailableSource {
  id: string;
  name: string;
  errorKind?: string;
}

const iconMap: Record<SearchResult["type"], React.ComponentType<{ className?: string }>> = {
  sport: Globe,
  team: Users,
  league: Trophy,
  match: Calendar,
  player: User,
};

function readRecentQueries(): string[] {
  try {
    const stored = localStorage.getItem(RECENT_QUERIES_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [status, setStatus] = useState<SearchStatus>("idle");
  const [unavailableSports, setUnavailableSports] = useState<SearchUnavailableSource[]>([]);
  // Read the stored queries once at mount instead of via an effect: the
  // palette renders only its trigger button until it is opened on the
  // client, so this cannot desync server and client markup, and it avoids
  // the extra cascading render an effect would cause.
  const [recentQueries, setRecentQueries] = useState<string[]>(readRecentQueries);
  const inputRef = useRef<HTMLInputElement>(null);
  // Monotonic request id: a slow response for "ten" must never overwrite the
  // results for "tennis".
  const requestRef = useRef(0);

  const resetSearch = useCallback(() => {
    requestRef.current += 1;
    setResults([]);
    setUnavailableSports([]);
    setStatus("idle");
  }, []);

  const closePalette = useCallback(() => {
    setOpen(false);
    setQuery("");
    resetSearch();
  }, [resetSearch]);

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
        closePalette();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closePalette]);

  const performSearch = useCallback(async (searchTerm: string) => {
    const requestId = ++requestRef.current;
    setStatus("searching");

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}`);

      if (requestId !== requestRef.current) return;

      if (!res.ok) {
        setResults([]);
        setUnavailableSports([]);
        setStatus("error");
        return;
      }

      const data = await res.json();
      if (requestId !== requestRef.current) return;

      const nextResults: SearchResult[] = Array.isArray(data.results) ? data.results : [];
      setResults(nextResults);
      setUnavailableSports(Array.isArray(data.unavailableSports) ? data.unavailableSports : []);
      setStatus(nextResults.length > 0 ? "results" : "empty");
    } catch {
      if (requestId !== requestRef.current) return;
      setResults([]);
      setUnavailableSports([]);
      setStatus("error");
    }
  }, []);

  // Typing updates the input state; a short query immediately clears any
  // previous results (and cancels in-flight requests) so stale hits can never
  // be shown for a new query.
  const applyQuery = useCallback(
    (value: string) => {
      setQuery(value);
      if (value.trim().length < MIN_SEARCH_QUERY_LENGTH) {
        resetSearch();
      } else {
        setStatus("searching");
      }
    },
    [resetSearch]
  );

  useEffect(() => {
    if (!open) return;

    const trimmed = query.trim();
    if (trimmed.length < MIN_SEARCH_QUERY_LENGTH) return;

    const timer = setTimeout(() => {
      void performSearch(trimmed);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query, open, performSearch]);

  const saveRecentQuery = useCallback((q: string) => {
    const stored = q.trim();
    if (!stored) return;
    setRecentQueries((prev) => {
      const updated = [stored, ...prev.filter((r) => r !== stored)].slice(0, MAX_RECENT);
      localStorage.setItem(RECENT_QUERIES_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleSelect = (result: SearchResult) => {
    saveRecentQuery(result.name);
    router.push(result.href);
    closePalette();
  };

  const handleRecentClick = (q: string) => {
    applyQuery(q);
  };

  const trimmedQuery = query.trim();
  const isTooShort = trimmedQuery.length > 0 && trimmedQuery.length < MIN_SEARCH_QUERY_LENGTH;
  const isActiveSearch = trimmedQuery.length >= MIN_SEARCH_QUERY_LENGTH;

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
            onClick={closePalette}
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
                  placeholder="Search teams, players, leagues, matches, sports..."
                  value={query}
                  onChange={(e) => applyQuery(e.target.value)}
                  className="w-full text-lg focus:outline-none bg-transparent text-text-primary placeholder-text-secondary font-mono"
                />
                <p
                  className="mt-1.5 text-[0.6rem] font-mono tracking-widest text-text-secondary/70 uppercase truncate"
                  title={`Scope: ${SEARCH_TARGETS.join(", ")} · ${COVERED_SPORTS.join(", ")}`}
                >
                  SCOPE · {SEARCH_TARGETS.join(" · ")} · {COVERED_SPORTS.join(" · ")}
                </p>
              </div>

              <div className="max-h-[400px] overflow-y-auto">
                {trimmedQuery.length === 0 && recentQueries.length > 0 && (
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

                {isTooShort && (
                  <div className="px-4 py-3 font-mono text-xs text-text-secondary">
                    KEEP TYPING — AT LEAST {MIN_SEARCH_QUERY_LENGTH} CHARACTERS
                  </div>
                )}

                {isActiveSearch && status === "searching" && (
                  <div className="px-4 py-3 font-mono text-xs text-text-secondary" role="status">
                    SEARCHING…
                  </div>
                )}

                {isActiveSearch && status === "error" && (
                  <div className="px-4 py-3 font-mono text-xs text-gold" role="alert">
                    SEARCH UNAVAILABLE — PLEASE TRY AGAIN
                  </div>
                )}

                {isActiveSearch && status === "empty" && (
                  <div className="px-4 py-3 font-mono text-xs text-text-secondary">
                    NO RESULTS FOR “{trimmedQuery}”
                    <span className="block text-text-secondary/70 mt-1">
                      Searched {SEARCH_TARGETS.join(", ")}.
                    </span>
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
                              <span
                                role="img"
                                aria-label={result.name}
                                className="w-6 h-6 bg-no-repeat bg-center bg-contain shrink-0"
                                style={{ backgroundImage: `url(${result.logo})` }}
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

              {isActiveSearch && unavailableSports.length > 0 && (
                <div className="px-4 py-2 border-t border-border-subtle bg-gold/5" role="status">
                  <p className="text-[0.6rem] font-mono tracking-widest text-gold uppercase">
                    Partial search · live data unavailable:{" "}
                    {unavailableSports.map((sport) => sport.name).join(" · ")}
                  </p>
                </div>
              )}

              <div className="px-4 py-2 border-t border-border-subtle flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-mono text-text-secondary">
                  <kbd className="px-1.5 py-0.5 bg-surface-2/50 rounded">↑↓</kbd>
                  <span>navigate</span>
                  <kbd className="px-1.5 py-0.5 bg-surface-2/50 rounded">↵</kbd>
                  <span>select</span>
                </div>
                <button
                  type="button"
                  onClick={closePalette}
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
