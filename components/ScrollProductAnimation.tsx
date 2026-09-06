"use client";

import { useCallback, useRef, useState } from "react";
import { useFrameCanvas } from "@/hooks/useFrameCanvas";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { FRAME_COUNT, sceneForFrame, sceneProgress } from "@/lib/frames";

const SCROLL_HEIGHT_CLASS = "h-[550vh]";

function fadeInOut(t: number): number {
  if (t < 0.18) return t / 0.18;
  if (t > 0.82) return (1 - t) / 0.18;
  return 1;
}

export default function ScrollProductAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const captionRef = useRef<HTMLParagraphElement>(null);
  const beforeLabelRef = useRef<HTMLSpanElement>(null);
  const afterLabelRef = useRef<HTMLSpanElement>(null);
  const finalOverlayRef = useRef<HTMLDivElement>(null);
  const finalCtaRef = useRef<HTMLAnchorElement>(null);

  const [captionText, setCaptionText] = useState<string | null>(null);
  const lastSceneId = useRef<string>("closed");

  const reducedMotion = usePrefersReducedMotion();
  const renderFrame = useFrameCanvas(canvasRef);

  const handleProgress = useCallback(
    (progress: number) => {
      const frame = Math.min(
        FRAME_COUNT,
        Math.max(1, Math.round(progress * (FRAME_COUNT - 1)) + 1)
      );

      renderFrame(frame);

      const scene = sceneForFrame(frame);
      const t = sceneProgress(frame, scene);

      if (scene.id !== lastSceneId.current) {
        lastSceneId.current = scene.id;
        setCaptionText(scene.caption && scene.id !== "final" ? scene.caption : null);
      }

      const isBeforeAfter = scene.id === "beforeAfter";
      const isFinal = scene.id === "final";

      if (captionRef.current) {
        captionRef.current.style.opacity =
          !isBeforeAfter && !isFinal && scene.caption ? String(fadeInOut(t)) : "0";
      }

      if (beforeLabelRef.current && afterLabelRef.current) {
        const opacity = isBeforeAfter ? String(fadeInOut(t)) : "0";
        beforeLabelRef.current.style.opacity = opacity;
        afterLabelRef.current.style.opacity = opacity;
      }

      if (finalOverlayRef.current) {
        const opacity = isFinal ? Math.min(1, t / 0.55) : 0;
        finalOverlayRef.current.style.opacity = String(opacity);
        finalOverlayRef.current.style.transform = `translateY(${(1 - opacity) * 16}px)`;
      }

      if (finalCtaRef.current) {
        finalCtaRef.current.style.pointerEvents = isFinal && t > 0.5 ? "auto" : "none";
      }
    },
    [renderFrame]
  );

  useScrollAnimation(containerRef, handleProgress, reducedMotion);

  return (
    <section
      ref={containerRef}
      aria-label="Sequência cinematográfica do Sabão Polibrilho"
      className={reducedMotion ? "relative h-[100dvh] w-full" : `relative w-full ${SCROLL_HEIGHT_CLASS}`}
    >
      <div className="sticky top-0 flex h-[100dvh] w-full items-center justify-center overflow-hidden bg-bg">
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="absolute inset-0 h-full w-full"
        />

        {/* Scene caption (paste, before-scene "ANTES", etc.) */}
        <p
          ref={captionRef}
          className="pointer-events-none absolute bottom-[18%] left-1/2 -translate-x-1/2 text-center text-xs font-medium tracking-[0.35em] text-ink opacity-0 transition-opacity duration-150 sm:text-sm"
        >
          {captionText}
        </p>

        {/* Before / after labels */}
        <span
          ref={afterLabelRef}
          className="pointer-events-none absolute left-[10%] top-1/2 -translate-y-1/2 text-xs font-semibold tracking-[0.3em] text-silver-light opacity-0 transition-opacity duration-150 sm:text-sm"
        >
          DEPOIS
        </span>
        <span
          ref={beforeLabelRef}
          className="pointer-events-none absolute right-[10%] top-1/2 -translate-y-1/2 text-xs font-semibold tracking-[0.3em] text-ink-muted opacity-0 transition-opacity duration-150 sm:text-sm"
        >
          ANTES
        </span>

        {/* Final beat: title + CTA */}
        <div
          ref={finalOverlayRef}
          className="pointer-events-none absolute inset-x-0 bottom-[12%] z-10 flex flex-col items-center px-6 text-center opacity-0 sm:bottom-[15%]"
          style={{ transition: "opacity 0.2s linear, transform 0.2s linear" }}
        >
          <h2 className="text-3xl font-black tracking-tight text-ink sm:text-5xl">
            BRILHO DE VERDADE.
          </h2>
          <p className="mt-3 max-w-sm text-sm font-light text-ink-muted">
            Seu carro merece esse cuidado.
          </p>
          <a
            ref={finalCtaRef}
            href="#produto"
            className="focus-ring pointer-events-none mt-7 rounded-sm border border-silver-light bg-silver-light px-8 py-3.5 text-xs font-semibold tracking-[0.2em] text-bg transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98]"
          >
            QUERO MEU POLIBRILHO
          </a>
        </div>

        <p className="sr-only">
          Sequência cinematográfica: o pote do Sabão Polibrilho fechado gira
          suavemente, a tampa desenrosca e revela a pasta branca cremosa, uma
          esponja recolhe o produto e aplica na lataria de um carro preto,
          que passa de fosca a extremamente brilhante. Uma comparação de
          antes e depois mostra o resultado final, encerrando novamente no
          pote Polibrilho com a chamada para ação &quot;Quero meu
          Polibrilho&quot;.
        </p>
      </div>
    </section>
  );
}
