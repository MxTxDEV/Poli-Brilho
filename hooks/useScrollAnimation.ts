"use client";

import { useEffect, useRef, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Drives `onProgress(0..1)` from the scroll position across a tall
 * (CSS `position: sticky` pinned) container. GSAP ScrollTrigger only
 * measures scroll here — the pin itself is plain CSS sticky, which is
 * cheaper and avoids layout quirks on mobile browsers with dynamic
 * viewport chrome.
 */
export function useScrollAnimation(
  containerRef: RefObject<HTMLElement | null>,
  onProgress: (progress: number) => void,
  disabled: boolean
) {
  const onProgressRef = useRef(onProgress);

  useEffect(() => {
    onProgressRef.current = onProgress;
  }, [onProgress]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (disabled) {
      onProgressRef.current(1);
      return;
    }

    const st = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => onProgressRef.current(self.progress),
    });

    return () => {
      st.kill();
    };
  }, [containerRef, disabled]);
}
