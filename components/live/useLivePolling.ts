"use client";

import { useEffect } from "react";

export const LIVE_POLL_INTERVAL_MS = 30_000;

export function useLivePolling(refresh: () => void) {
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;

    function schedule() {
      clearInterval(timer);
      if (document.visibilityState === "visible") {
        timer = setInterval(refresh, LIVE_POLL_INTERVAL_MS);
      }
    }

    function onVisibilityChange() {
      schedule();
      if (document.visibilityState === "visible") refresh();
    }

    schedule();
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [refresh]);
}
