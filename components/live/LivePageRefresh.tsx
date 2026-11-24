"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLivePolling } from "./useLivePolling";

export default function LivePageRefresh() {
  const router = useRouter();
  const refresh = useCallback(() => router.refresh(), [router]);
  useLivePolling(refresh);
  return null;
}
