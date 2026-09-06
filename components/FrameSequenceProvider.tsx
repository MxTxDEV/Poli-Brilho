"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useFrameSequence, type FrameSourceMode } from "@/hooks/useFrameSequence";

interface FrameSequenceContextValue {
  mode: FrameSourceMode;
  readyCount: number;
  getImage: (frameOneBased: number) => HTMLImageElement | null;
}

const FrameSequenceContext = createContext<FrameSequenceContextValue | null>(null);

/** Loads the frame sequence once and shares it between the Hero and the scroll animation. */
export function FrameSequenceProvider({ children }: { children: ReactNode }) {
  const value = useFrameSequence();
  return (
    <FrameSequenceContext.Provider value={value}>
      {children}
    </FrameSequenceContext.Provider>
  );
}

export function useFrameSequenceContext(): FrameSequenceContextValue {
  const ctx = useContext(FrameSequenceContext);
  if (!ctx) {
    throw new Error("useFrameSequenceContext must be used within FrameSequenceProvider");
  }
  return ctx;
}
