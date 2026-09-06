import { INSTAGRAM_HANDLE, INSTAGRAM_URL, WHATSAPP_DISPLAY, whatsappLink } from "@/lib/contact";

const LINKS = [
  { href: "#produto", label: "Produto" },
  { href: "#beneficios", label: "Benefícios" },
  { href: "#como-usar", label: "Como usar" },
  { href: "#contato", label: "Contato" },
];

export default function Footer() {
  return (
    <footer className="border-t border-line bg-bg px-6 py-14">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold tracking-[0.3em] text-ink">
            POLIBRILHO
          </p>
          <p className="mt-2 text-xs text-ink-muted">Sabão Polibrilho</p>
        </div>

        <nav className="flex flex-wrap gap-x-8 gap-y-3 text-xs tracking-[0.1em] text-ink-muted">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="focus-ring transition-colors hover:text-ink"
            >
              {link.label.toUpperCase()}
            </a>
          ))}
        </nav>

        <div className="flex flex-col gap-1 text-xs text-ink-muted">
          <a
            href={whatsappLink("Olá! Quero saber mais sobre o Sabão Polibrilho.")}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring transition-colors hover:text-ink"
          >
            WhatsApp: {WHATSAPP_DISPLAY}
          </a>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring transition-colors hover:text-ink"
          >
            Instagram: {INSTAGRAM_HANDLE}
          </a>
        </div>
      </div>

      <p className="mx-auto mt-12 max-w-6xl text-[11px] text-ink-muted/70">
        &copy; {new Date().getFullYear()} Polibrilho. Todos os direitos reservados.
      </p>
    </footer>
  );
}
