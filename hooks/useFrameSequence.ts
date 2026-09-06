"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FRAME_COUNT, PRELOAD_COUNT, frameUrl } from "@/lib/frames";

export type FrameSourceMode = "probing" | "images" | "placeholder";

/**
 * Loads the real frame sequence from /public/product/frames when present,
 * falling back to the procedural placeholder renderer otherwise.
 *
 * A single probe request decides the mode up front so an empty frames
 * folder (the default, until real photography/render frames are dropped
 * in) never triggers 209 wasted 404s — it just switches the whole
 * animation to placeholder mode. Once frames exist, they load in a
 * small eager burst (PRELOAD_COUNT) and then trickle in during idle
 * time so the tab never jank-loads hundreds of images at once.
 */
export function useFrameSequence() {
  const cache = useRef<Map<number, HTMLImageElement>>(new Map());
  const [mode, setMode] = useState<FrameSourceMode>("probing");
  const [readyCount, setReadyCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const probe = new Image();
    probe.onload = () => {
      if (cancelled) return;
      cache.current.set(1, probe);
      setReadyCount(1);
      setMode("images");
      loadRemaining();
    };
    probe.onerror = () => {
      if (!cancelled) setMode("placeholder");
    };
    probe.src = frameUrl(0);

    function loadRemaining() {
      let nextIndex = 2;
      let loaded = 1;

      const idle = (cb: () => void) => {
        const w = window as Window & {
          requestIdleCallback?: (cb: IdleRequestCallback) => number;
        };
        if (typeof w.requestIdleCallback === "function") {
          w.requestIdleCallback(cb, { timeout: 300 });
        } else {
          setTimeout(cb, 16);
        }
      };

      const loadOne = () => {
        if (cancelled || nextIndex > FRAME_COUNT) return;
        const i = nextIndex++;
        const img = new Image();
        img.onload = () => {
          cache.current.set(i, img);
          loaded++;
          setReadyCount(loaded);
          idle(loadOne);
        };
        img.onerror = () => idle(loadOne);
        img.src = frameUrl(i - 1);
      };

      const burst = Math.min(PRELOAD_COUNT, FRAME_COUNT - 1);
      for (let i = 0; i < burst; i++) loadOne();
    }

    return () => {
      cancelled = true;
    };
  }, []);

  const getImage = useCallback((frameOneBased: number) => {
    return cache.current.get(frameOneBased) ?? null;
  }, []);

  return { mode, readyCount, getImage };
}
