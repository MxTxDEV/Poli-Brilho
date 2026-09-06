import { Droplets, ShieldCheck, Sparkles } from "lucide-react";
import Reveal from "@/components/Reveal";

const BENEFITS = [
  {
    icon: Sparkles,
    title: "BRILHO PROFUNDO",
    description:
      "Realça rodas, motor e cromados com um acabamento denso e refletivo, digno de vitrine.",
  },
  {
    icon: ShieldCheck,
    title: "PROTEÇÃO",
    description:
      "Uma camada de cuidado contra sujeira, graxa e poeira do dia a dia na garagem.",
  },
  {
    icon: Droplets,
    title: "FÁCIL APLICAÇÃO",
    description:
      "Pasta cremosa que se espalha e remove com facilidade, sem esforço ou equipamento extra.",
  },
];

export default function Benefits() {
  return (
    <section
      id="beneficios"
      className="border-t border-line bg-bg px-6 py-28 md:py-36"
    >
      <div className="mx-auto max-w-6xl">
        <Reveal as="h2" className="text-center text-3xl font-black tracking-tight sm:text-5xl">
          FEITO PARA BRILHAR.
        </Reveal>

        <div className="mt-20 grid gap-16 sm:grid-cols-3 sm:gap-10">
          {BENEFITS.map((b, i) => (
            <Reveal key={b.title} delay={i * 0.1} className="flex flex-col items-center text-center">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-silver-dark/60">
                <b.icon size={22} strokeWidth={1.5} className="text-silver-light" aria-hidden="true" />
              </div>
              <h3 className="text-sm font-semibold tracking-[0.15em] text-ink">
                {b.title}
              </h3>
              <p className="mt-3 max-w-[26ch] text-sm font-light leading-relaxed text-ink-muted">
                {b.description}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
