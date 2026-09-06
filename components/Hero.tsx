"use client";

import { useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { useFrameCanvas } from "@/hooks/useFrameCanvas";

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderFrame = useFrameCanvas(canvasRef);

  useEffect(() => {
    renderFrame(1);
  }, [renderFrame]);

  return (
    <section
      id="topo"
      className="relative flex h-[100dvh] w-full flex-col items-center justify-center overflow-hidden bg-bg"
    >
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Pote do Sabão Polibrilho fechado, centralizado sobre fundo preto com iluminação de estúdio"
        className="absolute inset-0 h-full w-full"
      />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/70" />

      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <p className="mb-5 text-xs font-medium tracking-[0.4em] text-ink-muted">
          POLIBRILHO
        </p>
        <h1 className="text-4xl font-black tracking-tight text-ink sm:text-6xl md:text-7xl">
          BRILHO DE VERDADE.
        </h1>
        <p className="mt-5 max-w-md text-sm font-light text-ink-muted sm:text-base">
          Performance para quem exige mais do seu veículo.
        </p>
      </div>

      <div className="absolute bottom-9 z-10 flex flex-col items-center gap-2 text-[10px] font-medium tracking-[0.3em] text-ink-muted">
        <span>SCROLL PARA EXPLORAR</span>
        <ChevronDown className="animate-bounce" size={16} aria-hidden="true" />
      </div>
    </section>
  );
}
