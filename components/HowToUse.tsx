import { Hand, RefreshCw, SprayCan } from "lucide-react";
import Reveal from "@/components/Reveal";

const STEPS = [
  {
    number: "01",
    title: "APLIQUE",
    description: "Retire uma pequena quantidade do pote com um aplicador ou pano macio.",
    icon: SprayCan,
  },
  {
    number: "02",
    title: "ESPALHE",
    description: "Espalhe uniformemente sobre a superfície, em movimentos suaves.",
    icon: Hand,
  },
  {
    number: "03",
    title: "REMOVA / FINALIZE",
    description: "Remova o excesso com um pano limpo e revele o brilho.",
    icon: RefreshCw,
  },
];

export default function HowToUse() {
  return (
    <section
      id="como-usar"
      className="border-t border-line bg-bg-elevated px-6 py-28 md:py-36"
    >
      <div className="mx-auto max-w-6xl">
        <Reveal as="h2" className="text-center text-3xl font-black tracking-tight sm:text-5xl">
          COMO USAR
        </Reveal>

        <div className="relative mt-20 grid gap-16 sm:grid-cols-3 sm:gap-10">
          <div
            aria-hidden="true"
            className="absolute left-0 right-0 top-7 hidden h-px bg-line sm:block"
          />
          {STEPS.map((step, i) => (
            <Reveal key={step.number} delay={i * 0.12} className="relative flex flex-col items-center text-center">
              <div className="relative z-10 mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-silver-dark/60 bg-bg-elevated">
                <step.icon size={20} strokeWidth={1.5} className="text-silver-light" aria-hidden="true" />
              </div>
              <span className="text-xs font-semibold tracking-[0.3em] text-silver-dark">
                {step.number}
              </span>
              <h3 className="mt-2 text-sm font-semibold tracking-[0.15em] text-ink">
                {step.title}
              </h3>
              <p className="mt-3 max-w-[26ch] text-sm font-light leading-relaxed text-ink-muted">
                {step.description}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
