import { ChevronDown } from "lucide-react";
import { POTE_PHOTO } from "@/lib/assets";

export default function Hero() {
  return (
    <section
      id="topo"
      className="relative flex h-[100dvh] w-full flex-col items-center justify-center overflow-hidden bg-bg px-6"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[38%] h-[55vh] w-[55vh] -translate-x-1/2 -translate-y-1/2 rounded-full bg-silver-light/10 blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center">
        <p className="mb-5 text-xs font-medium tracking-[0.4em] text-ink-muted">
          POLIBRILHO
        </p>
        <h1 className="text-4xl font-black tracking-tight text-ink sm:text-6xl md:text-7xl">
          BRILHO DE VERDADE.
        </h1>
        <p className="mt-5 max-w-md text-sm font-light text-ink-muted sm:text-base">
          Performance para quem exige mais do seu veículo.
        </p>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={POTE_PHOTO}
          alt="Pote do Sabão Polibrilho, 500g, fechado"
          className="mt-10 max-h-[30vh] w-auto drop-shadow-[0_30px_45px_rgba(0,0,0,0.65)] sm:max-h-[38vh]"
        />
      </div>

      <div className="absolute bottom-9 z-10 flex flex-col items-center gap-2 text-[10px] font-medium tracking-[0.3em] text-ink-muted">
        <span>SCROLL PARA EXPLORAR</span>
        <ChevronDown className="animate-bounce" size={16} aria-hidden="true" />
      </div>
    </section>
  );
}
