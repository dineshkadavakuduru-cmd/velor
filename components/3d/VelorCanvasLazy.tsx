"use client";

import dynamic from "next/dynamic";
import SceneFallback from "./SceneFallback";

const LazyVelorCanvas = dynamic(() => import("./VelorCanvas"), {
  ssr: false,
  loading: () => <SceneFallback />,
});

export default LazyVelorCanvas;
