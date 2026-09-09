"use client";

import { useCallback, useEffect, useRef, type RefObject } from "react";
import { drawImageCover, fitCanvasToElement } from "@/lib/canvas-utils";
import { drawPlaceholderFrame, onPhotoLoad } from "@/lib/placeholder-scene";
import { useFrameSequenceContext } from "@/components/FrameSequenceProvider";

/**
 * Renders a given (1-based) frame index onto a canvas — the real photo if
 * it has loaded, the procedural placeholder otherwise — and keeps the
 * canvas sized to its container. Returns a `renderFrame` function callers
 * can invoke on every scroll update.
 */
export function useFrameCanvas(canvasRef: RefObject<HTMLCanvasElement | null>) {
  const { mode, getImage } = useFrameSequenceContext();
  const lastFrame = useRef(1);

  const renderFrame = useCallback(
    (frameOneBased: number) => {
      lastFrame.current = frameOneBased;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // The car photo is drawn well above its native size, so ask for the
      // better resampling kernel instead of the browser default.
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      const { width, height } = canvas;
      const img = mode === "images" ? getImage(frameOneBased) : null;

      if (img) {
        ctx.clearRect(0, 0, width, height);
        drawImageCover(ctx, img, width, height);
      } else {
        drawPlaceholderFrame(ctx, width, height, frameOneBased);
      }
    },
    [canvasRef, mode, getImage]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      fitCanvasToElement(canvas);
      renderFrame(lastFrame.current);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [canvasRef, renderFrame]);

  // Re-render the current frame whenever real images finish loading, so a
  // placeholder swaps seamlessly to the photographed frame once it's ready.
  useEffect(() => {
    renderFrame(lastFrame.current);
  }, [mode, renderFrame]);

  // The scene's own product photography loads asynchronously too, and frames
  // are otherwise only drawn on scroll — repaint as soon as one arrives.
  useEffect(() => onPhotoLoad(() => renderFrame(lastFrame.current)), [renderFrame]);

  return renderFrame;
}
