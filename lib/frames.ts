/**
 * Central configuration for the scroll-driven frame sequence.
 *
 * Drop real frames into `/public/product/frames/` named
 * `frame_0001.webp` … `frame_0210.webp` and the site picks them up
 * automatically — nothing else needs to change. Until then,
 * `lib/placeholder-scene.ts` draws each frame procedurally so the
 * scroll experience works end to end.
 */

export const FRAME_COUNT = 210;
export const FRAME_PATH = "/product/frames";
export const FRAME_PREFIX = "frame_";
export const FRAME_EXT = "webp";
export const FRAME_WIDTH = 1920;
export const FRAME_HEIGHT = 1080;

/** How many frames to eagerly preload before the animation is considered ready. */
export const PRELOAD_COUNT = 24;

export function frameUrl(indexZeroBased: number): string {
  const n = Math.min(Math.max(indexZeroBased, 0), FRAME_COUNT - 1) + 1;
  return `${FRAME_PATH}/${FRAME_PREFIX}${String(n).padStart(4, "0")}.${FRAME_EXT}`;
}

export type SceneId =
  | "closed"
  | "lid"
  | "paste"
  | "sponge"
  | "transition"
  | "application"
  | "shine"
  | "beforeAfter"
  | "final";

export interface Scene {
  id: SceneId;
  label: string;
  /** Inclusive 1-based frame range, matching the shot list. */
  frames: [number, number];
  caption?: string;
}

export const SCENES: Scene[] = [
  { id: "closed", label: "Pote fechado", frames: [1, 25] },
  { id: "lid", label: "Tampa desenroscando", frames: [26, 50] },
  { id: "paste", label: "Pasta branca", frames: [51, 70], caption: "FÓRMULA DE ALTO DESEMPENHO" },
  { id: "sponge", label: "Esponja pegando produto", frames: [71, 90] },
  { id: "transition", label: "Transição para o carro", frames: [91, 115], caption: "ANTES" },
  { id: "application", label: "Aplicação", frames: [116, 145] },
  { id: "shine", label: "Brilho aparecendo", frames: [146, 170] },
  { id: "beforeAfter", label: "Antes e depois", frames: [171, 190] },
  { id: "final", label: "Produto final", frames: [191, 210], caption: "BRILHO DE VERDADE." },
];

export function sceneForFrame(frameOneBased: number): Scene {
  const found = SCENES.find(
    (s) => frameOneBased >= s.frames[0] && frameOneBased <= s.frames[1]
  );
  return found ?? SCENES[0];
}

/** Progress (0–1) within the scene's own frame range. */
export function sceneProgress(frameOneBased: number, scene: Scene): number {
  const [start, end] = scene.frames;
  if (end === start) return 1;
  return Math.min(Math.max((frameOneBased - start) / (end - start), 0), 1);
}
