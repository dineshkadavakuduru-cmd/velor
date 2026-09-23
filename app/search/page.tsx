"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import type { SearchResult } from "@/lib/types/sports";
import { validateSearchQuery } from "@/lib/api/validate";
import LiveHeader from "@/components/live/LiveHeader";
import ErrorState from "@/components/ui/ErrorState";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import EmptyState from "@/components/ui/EmptyState";
import EntityImage from "@/components/ui/EntityImage";

type Status = "idle" | "loading" | "results" | "empty" | "error";

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);

  const doSearch = useCallback(async (q: string) => {
    const trimmed = validateSearchQuery(q);
    if (!trimmed) {
      setResults([]);
      setStatus("idle");
      setSelectedIndex(-1);
      return;
    }

    setStatus("loading");
    setSelectedIndex(-1);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
      if (!res.ok) {
        throw new Error("SEARCH_FAILED");
      }
      const data = await res.json();
      const filteredResults = data.results ?? [];
      setResults(filteredResults);
      setStatus(filteredResults.length > 0 ? "results" : "empty");
    } catch {
      setResults([]);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      doSearch(query);
    }, 300);
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, doSearch]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => {
        const next = prev < results.length - 1 ? prev + 1 : 0;
        return next;
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => {
        const next = prev > 0 ? prev - 1 : results.length - 1;
        return next;
      });
    } else if (e.key === "Enter" && selectedIndex >= 0 && selectedIndex < results.length) {
      e.preventDefault();
      const result = results[selectedIndex];
      router.push(result.href);
    } else if (e.key === "Escape") {
      setQuery("");
      setResults([]);
      setStatus("idle");
      setSelectedIndex(-1);
      inputRef.current?.focus();
    }
  }, [results, selectedIndex, router]);

  const groupedResults = useMemo(() => {
    const groups: Record<string, SearchResult[]> = { team: [], league: [], match: [] };
    for (const result of results) {
      if (groups[result.type]) {
        groups[result.type].push(result);
      }
    }
    return groups;
  }, [results]);

  const typeLabels: Record<string, string> = { team: "TEAMS", league: "LEAGUES", match: "MATCHES" };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LiveHeader title="SEARCH" subtitle="Search teams, leagues, and matches." showLiveIndicator={false} />
      <div className="px-4 sm:px-6 lg:px-10 py-4 border-b border-border-subtle bg-surface-1/30">
        <div className="max-w-2xl">
          <label htmlFor="global-search" className="technical-label block mb-1.5">
            SEARCH VELOR
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
            <input
              ref={inputRef}
              id="global-search"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search teams, leagues, matches..."
              autoFocus
              className="w-full h-10 pl-9 pr-9 bg-surface-2 border border-border-default text-text-primary text-sm focus:outline-none focus:border-live transition-colors placeholder:text-text-secondary/60"
              aria-autocomplete="list"
              aria-controls="search-results"
              aria-activedescendant={selectedIndex >= 0 ? `search-result-${selectedIndex}` : undefined}
            />
            {query && (
              <button
                type="button"
                onClick={() => { setQuery(""); setResults([]); setStatus("idle"); setSelectedIndex(-1); inputRef.current?.focus(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {status === "results" && (
            <p className="text-xs text-text-secondary font-mono mt-2">
              {results.length} RESULT{results.length !== 1 ? "S" : ""} · USE ↑ ↓ TO NAVIGATE · ENTER TO SELECT
            </p>
          )}
        </div>
      </div>
      <div className="flex-1 px-4 sm:px-6 lg:px-10 py-6 sm:py-8">
        {status === "idle" && (
          <EmptyState
            title="START SEARCHING"
            description="Type at least 2 characters to search across teams, leagues, and matches."
          />
        )}

        {status === "loading" && (
          <div className="max-w-2xl">
            <LoadingSkeleton lines={4} />
          </div>
        )}

        {status === "error" && (
          <ErrorState title="SEARCH FAILED" description="We couldn't process your search. Please try again." />
        )}

        {status === "empty" && (
          <EmptyState
            title="NO RESULTS"
            description={`No results found for "${query}". Try a different search term.`}
          />
        )}

        {status === "results" && (
          <div id="search-results" className="max-w-2xl space-y-6" role="listbox">
            {Object.entries(groupedResults).map(([type, typeResults]) => {
              if (typeResults.length === 0) return null;
              return (
                <div key={type} className="space-y-1">
                  <span className="technical-label block mb-2">{typeLabels[type] ?? type.toUpperCase()}</span>
                  {typeResults.map((result) => {
                    const globalIndex = results.indexOf(result);
                    return (
                      <SearchResultItem
                        key={`${result.type}-${result.id}`}
                        result={result}
                        isSelected={globalIndex === selectedIndex}
                        id={`search-result-${globalIndex}`}
                        role="option"
                        aria-selected={globalIndex === selectedIndex}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function SearchResultItem({ result, isSelected, id, ...props }: { result: SearchResult; isSelected: boolean; id: string; [key: string]: unknown }) {
  const typeLabel = result.type.toUpperCase();
  const initials = result.name.slice(0, 2).toUpperCase();

  return (
    <Link
      id={id}
      href={result.href}
      className={`group flex items-center gap-4 p-4 border transition-colors ${
        isSelected
          ? "border-live bg-live/5"
          : "border-border-subtle hover:bg-surface-2/30 hover:border-border-strong"
      }`}
      {...props}
    >
      <EntityImage
        src={result.logo}
        alt={`${result.name} logo`}
        initials={initials}
        size="md"
      />
      <div className="flex-1 min-w-0">
        <p className="font-body text-sm text-text-primary truncate group-hover:text-live transition-colors">
          {result.name}
        </p>
        {result.subtitle && (
          <p className="font-mono text-[0.65rem] text-text-secondary tracking-widest uppercase">
            {result.subtitle}
          </p>
        )}
      </div>
      <span className="technical-label shrink-0">{typeLabel}</span>
    </Link>
  );
}
