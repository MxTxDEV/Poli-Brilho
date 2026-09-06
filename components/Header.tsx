"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const LINKS = [
  { href: "#produto", label: "PRODUTO" },
  { href: "#beneficios", label: "BENEFÍCIOS" },
  { href: "#como-usar", label: "COMO USAR" },
  { href: "#contato", label: "CONTATO" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter,padding,border-color] duration-500 ${
        scrolled
          ? "border-b border-line bg-bg/75 py-4 backdrop-blur-md"
          : "border-b border-transparent py-6"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 md:px-10">
        <a
          href="#topo"
          className="focus-ring text-sm font-semibold tracking-[0.3em] text-ink"
        >
          POLIBRILHO
        </a>

        <nav className="hidden items-center gap-10 text-xs font-medium tracking-[0.15em] text-ink-muted md:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="focus-ring transition-colors hover:text-ink"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#contato"
            className="focus-ring rounded-sm border border-silver/40 px-5 py-2.5 text-ink transition-colors hover:border-silver-light hover:text-silver-light"
          >
            COMPRAR
          </a>
        </nav>

        <button
          type="button"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="focus-ring text-ink md:hidden"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-line bg-bg px-6 py-6 text-sm tracking-[0.1em] text-ink-muted md:hidden">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="focus-ring border-b border-line/60 py-3 last:border-none"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#contato"
            onClick={() => setOpen(false)}
            className="focus-ring mt-3 rounded-sm border border-silver/40 py-3 text-center text-ink"
          >
            COMPRAR
          </a>
        </nav>
      )}
    </header>
  );
}
