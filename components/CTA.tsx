"use client";

import { useEffect, useRef } from "react";
import { useFrameCanvas } from "@/hooks/useFrameCanvas";
import Reveal from "@/components/Reveal";
import { whatsappLink } from "@/lib/contact";

const CTA_LINK = whatsappLink("Olá! Quero experimentar o Sabão Polibrilho.");
const CTA_SHOT_FRAME = 130;

export default function CTA() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderFrame = useFrameCanvas(canvasRef);

  useEffect(() => {
    renderFrame(CTA_SHOT_FRAME);
  }, [renderFrame]);

  return (
    <section
      id="contato"
      className="relative flex min-h-[85vh] w-full items-center justify-center overflow-hidden border-t border-line bg-bg px-6 py-28 text-center"
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 h-full w-full opacity-40"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-bg via-bg/70 to-bg" />

      <Reveal className="relative z-10 flex flex-col items-center">
        <h2 className="text-4xl font-black leading-tight tracking-tight sm:text-6xl">
          SEU CARRO.
          <br />
          SEU BRILHO.
        </h2>
        <p className="mt-5 text-xs font-medium tracking-[0.4em] text-ink-muted">
          POLIBRILHO
        </p>
        <a
          href={CTA_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="focus-ring mt-10 rounded-sm border border-silver-light bg-silver-light px-10 py-4 text-xs font-semibold tracking-[0.2em] text-bg transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98]"
        >
          QUERO EXPERIMENTAR
        </a>
      </Reveal>
    </section>
  );
}
