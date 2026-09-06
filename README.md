# Polibrilho

Site premium para o Sabão Polibrilho — cristalizador de brilho para rodas,
motor e cromados de carros e motos. Next.js (App Router) + TypeScript +
Tailwind CSS v4 + GSAP/ScrollTrigger, com a animação principal do produto
renderizada em `<canvas>` a partir de uma sequência de frames controlada
pelo scroll.

## Rodando localmente

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # build de produção
npm run start   # serve o build de produção
npm run lint    # eslint
```

## Como funciona a animação principal

`components/ScrollProductAnimation.tsx` fixa (`position: sticky`) um
`<canvas>` de tela cheia por 550vh de scroll. `hooks/useScrollAnimation.ts`
usa GSAP ScrollTrigger apenas para medir o progresso do scroll (0–1); esse
progresso escolhe o frame exibido (`lib/frames.ts`).

**Sequência de frames real:** coloque as imagens em
`public/product/frames/` seguindo `public/product/frames/README.md`
(`frame_0001.webp` … `frame_0210.webp`). Assim que o primeiro frame existir,
o site passa a carregá-los progressivamente (`hooks/useFrameSequence.ts`) —
nada mais precisa mudar.

**Enquanto não há frames reais:** `lib/placeholder-scene.ts` desenha a
mesma coreografia (pote fechado → tampa desenroscando → pasta → esponja →
carro → aplicação → brilho → antes/depois → pote final) de forma
procedural, com timing idêntico ao da sequência real. É esse renderizador
que está ativo hoje.

## Estrutura

```
app/                      rotas, layout, metadata/SEO, OG image
components/                Header, Hero, ScrollProductAnimation, Benefits,
                            HowToUse, Product, CTA, Footer, Reveal
hooks/                     useScrollAnimation, useFrameSequence,
                            useFrameCanvas, usePrefersReducedMotion
lib/                       frames.ts (config), placeholder-scene.ts,
                            canvas-utils.ts, interpolate.ts, contact.ts
public/product/frames/     onde entram os frames reais
```

## Contato do produto

- WhatsApp: 31 99783-7742
- Instagram: [@polibrilhoo_](https://instagram.com/polibrilhoo_)

Esses dados vivem em `lib/contact.ts` — é o único lugar que precisa mudar
se o número/handle for atualizado.
