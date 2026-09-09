import { MessageCircle } from "lucide-react";
import Reveal from "@/components/Reveal";
import { INSTAGRAM_HANDLE, WHATSAPP_DISPLAY, whatsappLink } from "@/lib/contact";
import { POTE_PHOTO } from "@/lib/assets";

const WHATSAPP_LINK = whatsappLink("Olá! Quero comprar o Sabão Polibrilho.");

export default function Product() {
  return (
    <section
      id="produto"
      className="border-t border-line bg-bg px-6 py-28 md:py-36"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-14 md:grid-cols-2 md:gap-20">
        <Reveal className="relative flex aspect-square items-center justify-center overflow-hidden rounded-md bg-bg-elevated p-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={POTE_PHOTO}
            alt="Pote do Sabão Polibrilho de 500g"
            className="max-h-full max-w-full object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.5)]"
          />
        </Reveal>

        <Reveal delay={0.1}>
          <p className="text-xs font-medium tracking-[0.35em] text-ink-muted">
            SABÃO POLIBRILHO
          </p>
          <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
            500g de brilho e proteção.
          </h2>
          <p className="mt-5 max-w-md text-sm font-light leading-relaxed text-ink-muted">
            A pasta cremosa do Polibrilho foi feita para rodas, motor e
            cromados de carros e motos — um único pote para cuidar de toda a
            garagem.
          </p>

          <p className="mt-8 text-2xl font-semibold tracking-tight text-ink">
            [PREÇO]
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="focus-ring rounded-sm bg-silver-light px-8 py-3.5 text-center text-xs font-semibold tracking-[0.2em] text-bg transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98]"
            >
              COMPRAR AGORA
            </a>
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="focus-ring flex items-center justify-center gap-2 rounded-sm border border-silver-dark/60 px-8 py-3.5 text-center text-xs font-semibold tracking-[0.2em] text-ink transition-colors duration-300 hover:border-silver-light hover:text-silver-light"
            >
              <MessageCircle size={15} aria-hidden="true" />
              FALAR NO WHATSAPP
            </a>
          </div>

          <div className="mt-10 flex flex-col gap-1 text-xs text-ink-muted">
            <span>WhatsApp: {WHATSAPP_DISPLAY}</span>
            <span>Instagram: {INSTAGRAM_HANDLE}</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
