"use client";

import { useSyncExternalStore } from "react";
import { formatIST, formatLocal } from "@/lib/utils/freshness";

interface MatchTimeProps {
  iso: string | undefined;
  className?: string;
}

const noopSubscribe = () => () => {};
const noop = () => undefined;

/**
 * Hydration-safe match kickoff time: always renders the fixed IST time on
 * server and client (no divergence), then upgrades to
 * "21:18 IST · [visitor's local time]" once client state is active.
 * The visitor's local timezone is an external system — synced through
 * useSyncExternalStore rather than effect-driven setState.
 */
export default function MatchTime({ iso, className = "" }: MatchTimeProps) {
  const local = useSyncExternalStore(
    noopSubscribe,
    iso ? () => formatLocal(iso) : noop,
    noop
  );

  if (!iso) return null;

  return (
    <span className={className}>
      {formatIST(iso)}
      {local && (
        <>
          <span aria-hidden="true" className="text-text-secondary/60"> · </span>
          <span>{local} local</span>
        </>
      )}
    </span>
  );
}
