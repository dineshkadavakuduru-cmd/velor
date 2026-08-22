"use client";

import { createContext, useContext, useRef, useState, type ReactNode } from "react";

interface PointerState {
  x: number;
  y: number;
}

interface SceneInteractionContextValue {
  pointer: PointerState;
  active: boolean;
  reducedMotion: boolean;
}

const SceneInteractionContext = createContext<SceneInteractionContextValue>({
  pointer: { x: 0, y: 0 },
  active: false,
  reducedMotion: false,
});

export function useSceneInteraction() {
  return useContext(SceneInteractionContext);
}

export function SceneInteractionProvider({ children }: { children: ReactNode }) {
  const [pointer, setPointer] = useState<PointerState>({ x: 0, y: 0 });
  const [active, setActive] = useState(false);
  const [reducedMotion] = useState<boolean>(() =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reducedMotion || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    setPointer({ x, y });
    setActive(true);
  };

  const handlePointerLeave = () => {
    setActive(false);
  };

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="absolute inset-0"
      style={{ touchAction: "none" }}
    >
      <SceneInteractionContext.Provider value={{ pointer, active, reducedMotion }}>
        {children}
      </SceneInteractionContext.Provider>
    </div>
  );
}
