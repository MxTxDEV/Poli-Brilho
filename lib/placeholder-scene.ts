import { CAR_PHOTO, POTE_PHOTO } from "./assets";
import { FRAME_COUNT, SCENES } from "./frames";
import { clamp01, keyframes, lerp, remap, seededSpecks, smoothstep } from "./interpolate";

/**
 * The scroll-driven scene, drawn from the real product photography.
 *
 * `useFrameCanvas` calls `drawPlaceholderFrame` for every scroll update. It
 * composes the two supplied photos — the jar and the car — into the nine-beat
 * choreography (jar → lid → paste → sponge → car → shine → before/after →
 * final) with camera moves, specular sweeps and a wipe that follows the car's
 * body. Dropping real frames into `/public/product/frames/` takes over from
 * this renderer without any other change.
 */

const frameP = (frameOneBased: number) => (frameOneBased - 1) / (FRAME_COUNT - 1);

const sceneFrame = (id: (typeof SCENES)[number]["id"]) =>
  SCENES.find((s) => s.id === id)!.frames[1];

const BP = {
  closedEnd: frameP(sceneFrame("closed")),
  lidEnd: frameP(sceneFrame("lid")),
  pasteEnd: frameP(sceneFrame("paste")),
  spongeEnd: frameP(sceneFrame("sponge")),
  transitionEnd: frameP(sceneFrame("transition")),
  applicationEnd: frameP(sceneFrame("application")),
  shineEnd: frameP(sceneFrame("shine")),
  beforeAfterEnd: frameP(sceneFrame("beforeAfter")),
};

const DUST = seededSpecks(70, 1337);
const GRAIN = seededSpecks(160, 71);
const SPARKLE = seededSpecks(18, 404);

const INK = {
  black: "#050505",
  panel: "#0c0c0d",
  silverLight: "#f2f3f4",
};

/* ------------------------------------------------------------------ photos */

const photoCache = new Map<string, HTMLImageElement>();
const photoRequested = new Set<string>();
const photoListeners = new Set<() => void>();

/**
 * Subscribes to photo loads. A frame is only drawn in response to a scroll
 * update, so without this a photo that finishes loading after the current
 * frame was painted would not appear until the next scroll — landing partway
 * down the page would leave the abstract fallback on screen indefinitely.
 */
export function onPhotoLoad(listener: () => void): () => void {
  photoListeners.add(listener);
  return () => {
    photoListeners.delete(listener);
  };
}

/** Returns the decoded photo once it has loaded, kicking off the load on first ask. */
function photo(src: string): HTMLImageElement | null {
  const loaded = photoCache.get(src);
  if (loaded) return loaded;
  if (typeof window === "undefined" || photoRequested.has(src)) return null;

  photoRequested.add(src);
  const img = new Image();
  // The originals are served from GitHub, so ask for CORS explicitly — without
  // it the canvas would be tainted and the compositing passes below would fail.
  img.crossOrigin = "anonymous";
  img.onload = () => {
    photoCache.set(src, img);
    for (const listener of photoListeners) listener();
  };
  img.src = src;
  return null;
}

/**
 * A single reusable offscreen canvas. Highlights and tints have to be clipped
 * to a photo's own alpha rather than its bounding box, which means compositing
 * them onto a layer that holds nothing but the photo.
 */
let scratch: HTMLCanvasElement | null = null;

function scratchLayer(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  if (!scratch) scratch = document.createElement("canvas");
  const cw = Math.max(1, Math.ceil(w));
  const ch = Math.max(1, Math.ceil(h));
  if (scratch.width !== cw || scratch.height !== ch) {
    scratch.width = cw;
    scratch.height = ch;
  }
  const ctx = scratch.getContext("2d")!;
  ctx.clearRect(0, 0, cw, ch);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  return [scratch, ctx];
}

/** A soft highlight band sweeping across the layer's diagonal, centred on `at`. */
function sweepGradient(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  at: number,
  strength: number
): CanvasGradient {
  const g = ctx.createLinearGradient(0, 0, w, h);
  const c = clamp01(at);
  const edge = 0.11;
  g.addColorStop(0, "rgba(255,255,255,0)");
  if (c - edge > 0) g.addColorStop(c - edge, "rgba(255,255,255,0)");
  g.addColorStop(c, `rgba(255,255,255,${0.4 * strength})`);
  if (c + edge < 1) g.addColorStop(c + edge, "rgba(255,255,255,0)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  return g;
}

/* ----------------------------------------------------------------- backdrop */

function drawBackdrop(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = INK.black;
  ctx.fillRect(0, 0, w, h);

  const glowY = h * 0.42;
  const glow = ctx.createRadialGradient(w / 2, glowY, 0, w / 2, glowY, Math.max(w, h) * 0.55);
  glow.addColorStop(0, "rgba(255,255,255,0.10)");
  glow.addColorStop(0.5, "rgba(255,255,255,0.03)");
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "rgba(255,255,255,1)";
  for (const s of GRAIN) {
    ctx.globalAlpha = s.a * 0.12;
    ctx.beginPath();
    ctx.arc(s.x * w, s.y * h, s.r * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  const vig = ctx.createRadialGradient(
    w / 2,
    h / 2,
    Math.min(w, h) * 0.3,
    w / 2,
    h / 2,
    Math.max(w, h) * 0.75
  );
  vig.addColorStop(0, "rgba(0,0,0,0)");
  vig.addColorStop(1, "rgba(0,0,0,0.55)");
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);
}

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

/* ------------------------------------------------------------- the jar shot */

interface ProductShot {
  cx: number;
  cy: number;
  /** Drawn height in device pixels; width follows the photo's aspect ratio. */
  height: number;
  tilt: number;
  /** 0..1 position of the specular band along the jar's diagonal. */
  sweep: number;
  sweepStrength: number;
  glow: number;
}

/** A soft pool of light standing in for the jar until its photo has loaded. */
function drawProductGlow(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) {
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.6);
  g.addColorStop(0, "rgba(242,243,244,0.14)");
  g.addColorStop(0.6, "rgba(199,201,204,0.05)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(cx - size, cy - size, size * 2, size * 2);
}

function drawProductPhoto(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  shot: ProductShot
) {
  const base = ctx.globalAlpha;
  const h = shot.height;
  const w = h * (img.width / img.height);
  const top = shot.cy - h / 2;

  if (shot.glow > 0.01) {
    const halo = ctx.createRadialGradient(shot.cx, shot.cy, 0, shot.cx, shot.cy, w * 0.9);
    halo.addColorStop(0, `rgba(242,243,244,${0.15 * shot.glow})`);
    halo.addColorStop(0.55, `rgba(199,201,204,${0.05 * shot.glow})`);
    halo.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = halo;
    ctx.fillRect(shot.cx - w, shot.cy - w, w * 2, w * 2);
  }

  // contact shadow on the studio floor
  ctx.save();
  ctx.globalAlpha = base * 0.5;
  ctx.filter = `blur(${Math.max(3, h * 0.03)}px)`;
  ctx.fillStyle = "#000000";
  ctx.beginPath();
  ctx.ellipse(shot.cx, top + h * 0.97, w * 0.34, h * 0.045, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  const pad = Math.ceil(Math.max(4, h * 0.02));
  const [layer, lctx] = scratchLayer(w + pad * 2, h + pad * 2);
  lctx.drawImage(img, pad, pad, w, h);

  if (shot.sweepStrength > 0.02) {
    lctx.globalCompositeOperation = "source-atop";
    lctx.fillStyle = sweepGradient(lctx, layer.width, layer.height, shot.sweep, shot.sweepStrength);
    lctx.fillRect(0, 0, layer.width, layer.height);
    lctx.globalCompositeOperation = "source-over";
  }

  ctx.save();
  ctx.translate(shot.cx, shot.cy);
  ctx.rotate(shot.tilt);
  ctx.drawImage(layer, -(w / 2 + pad), -(h / 2 + pad));
  ctx.restore();
}

/* ------------------------------------------------------------- the car shot */

interface CarParams {
  w: number;
  h: number;
  scale: number;
  /** 0..1 glossy fraction, wiped in from the left. */
  coverage: number;
  applicator: { visible: number; x: number };
  dividerT: number;
}

interface StageRect {
  px: number;
  py: number;
  pw: number;
  ph: number;
  coverX: number;
  coverage: number;
  dividerT: number;
}

/**
 * The dull "antes" and glossy "depois" treatments are expensive (a blur, two
 * colour filters, seventy dust specks) and depend only on the drawn size, so
 * they are baked once per size instead of on every scroll tick.
 */
let carVariantKey = "";
let carDull: HTMLCanvasElement | null = null;
let carGloss: HTMLCanvasElement | null = null;

function bakeCarVariant(
  img: HTMLImageElement,
  w: number,
  h: number,
  filter: string,
  treat: (ctx: CanvasRenderingContext2D) => void
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.ceil(w));
  canvas.height = Math.max(1, Math.ceil(h));
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.filter = filter;
  ctx.drawImage(img, 0, 0, w, h);
  ctx.filter = "none";
  // source-atop keeps every following pass inside the car's own silhouette,
  // so nothing bleeds onto the studio floor behind it.
  ctx.globalCompositeOperation = "source-atop";
  treat(ctx);
  ctx.globalCompositeOperation = "source-over";
  return canvas;
}

function ensureCarVariants(img: HTMLImageElement, w: number, h: number) {
  const key = `${Math.round(w)}x${Math.round(h)}`;
  if (key === carVariantKey && carDull && carGloss) return;
  carVariantKey = key;

  carDull = bakeCarVariant(
    img,
    w,
    h,
    "grayscale(0.55) brightness(0.62) contrast(0.9) blur(0.7px)",
    (ctx) => {
      // a thin grey film, not a black wash — dust scatters light, it does
      // not simply darken the paint
      ctx.fillStyle = "rgba(122,124,120,0.14)";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#d8d8d4";
      const speck = Math.max(1, w / 1600);
      for (const d of DUST) {
        ctx.globalAlpha = d.a * 0.26;
        ctx.beginPath();
        ctx.arc(d.x * w, d.y * h, d.r * speck * 1.1, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
  );

  carGloss = bakeCarVariant(
    img,
    w,
    h,
    "saturate(1.2) contrast(1.32) brightness(1.16)",
    (ctx) => {
      ctx.fillStyle = sweepGradient(ctx, w, h, 0.5, 0.8);
      ctx.fillRect(0, 0, w, h);
    }
  );
}

/**
 * Clips to the car's bounding box, replacing the vertical edge at `coverX`
 * with a gentle diagonal so the before/after boundary reads as a wipe across
 * the body rather than a straight cut across the whole backdrop.
 */
function clipCarDiagonalSide(
  ctx: CanvasRenderingContext2D,
  side: "left" | "right",
  carX: number,
  carY: number,
  carW: number,
  carH: number,
  coverX: number,
  slant: number
) {
  const topX = coverX - slant;
  const botX = coverX + slant;
  ctx.beginPath();
  if (side === "left") {
    ctx.moveTo(carX, carY);
    ctx.lineTo(topX, carY);
    ctx.lineTo(botX, carY + carH);
    ctx.lineTo(carX, carY + carH);
  } else {
    ctx.moveTo(topX, carY);
    ctx.lineTo(carX + carW, carY);
    ctx.lineTo(carX + carW, carY + carH);
    ctx.lineTo(botX, carY + carH);
  }
  ctx.closePath();
  ctx.clip();
}

function drawCarAlignedDivider(
  ctx: CanvasRenderingContext2D,
  carY: number,
  carH: number,
  coverX: number,
  slant: number,
  dividerT: number
) {
  if (dividerT <= 0.02) return;
  const base = ctx.globalAlpha;
  ctx.globalAlpha = base * dividerT;
  ctx.strokeStyle = INK.silverLight;
  ctx.lineWidth = Math.max(1.5, carH * 0.008);
  // keep the line on the bodywork rather than the empty box around it
  const top = 0.24;
  const bottom = 0.96;
  const xAt = (t: number) => coverX - slant + slant * 2 * t;
  ctx.beginPath();
  ctx.moveTo(xAt(top), carY + carH * top);
  ctx.lineTo(xAt(bottom), carY + carH * bottom);
  ctx.stroke();

  const r = carH * 0.045;
  ctx.beginPath();
  ctx.arc(coverX, carY + carH * 0.5, r, 0, Math.PI * 2);
  ctx.fillStyle = INK.silverLight;
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.4)";
  ctx.stroke();
  ctx.globalAlpha = base;
}

function drawBeforeAfterDivider(ctx: CanvasRenderingContext2D, stage: StageRect) {
  const { py, ph, coverX, dividerT, pw } = stage;
  if (dividerT <= 0.02) return;
  const base = ctx.globalAlpha;
  ctx.globalAlpha = base * dividerT;
  ctx.strokeStyle = INK.silverLight;
  ctx.lineWidth = Math.max(1.5, pw * 0.0028);
  ctx.beginPath();
  ctx.moveTo(coverX, py);
  ctx.lineTo(coverX, py + ph);
  ctx.stroke();

  const r = pw * 0.018;
  ctx.beginPath();
  ctx.arc(coverX, py + ph * 0.5, r, 0, Math.PI * 2);
  ctx.fillStyle = INK.silverLight;
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.4)";
  ctx.stroke();
  ctx.globalAlpha = base;
}

/** Geometry of the car inside the stage, shared by the panel and the applicator. */
function carRect(img: HTMLImageElement, stage: StageRect) {
  const { px, py, pw, ph } = stage;
  const ratio = img.width / img.height;
  let carW = pw * 0.96;
  let carH = carW / ratio;
  const maxH = ph * 0.68;
  if (carH > maxH) {
    carH = maxH;
    carW = carH * ratio;
  }
  return {
    carX: px + (pw - carW) / 2,
    carY: py + ph * 0.52 - carH / 2,
    carW,
    carH,
  };
}

function drawStudioFloor(ctx: CanvasRenderingContext2D, stage: StageRect) {
  const { px, py, pw, ph } = stage;
  const floor = ctx.createLinearGradient(0, py, 0, py + ph);
  floor.addColorStop(0, "#141416");
  floor.addColorStop(0.7, "#0b0b0c");
  floor.addColorStop(1, "#050505");
  ctx.fillStyle = floor;
  ctx.fillRect(px, py, pw, ph);
}

function drawRealCarPanel(ctx: CanvasRenderingContext2D, img: HTMLImageElement, stage: StageRect) {
  const { px, py, pw, ph, coverage, dividerT } = stage;

  ctx.save();
  ctx.beginPath();
  ctx.rect(px, py, pw, ph);
  ctx.clip();

  drawStudioFloor(ctx, stage);

  const { carX, carY, carW, carH } = carRect(img, stage);
  ensureCarVariants(img, carW, carH);

  // ground shadow
  ctx.save();
  ctx.globalAlpha = ctx.globalAlpha * 0.55;
  ctx.filter = `blur(${Math.max(3, carH * 0.03)}px)`;
  ctx.fillStyle = "#000000";
  ctx.beginPath();
  ctx.ellipse(carX + carW * 0.5, carY + carH * 0.95, carW * 0.44, carH * 0.06, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  const carCoverX = carX + carW * coverage;
  const slant = carH * 0.16;

  if (carDull) {
    ctx.save();
    clipCarDiagonalSide(ctx, "right", carX, carY, carW, carH, carCoverX, slant);
    ctx.drawImage(carDull, carX, carY, carW, carH);
    ctx.restore();
  }

  if (carGloss) {
    ctx.save();
    clipCarDiagonalSide(ctx, "left", carX, carY, carW, carH, carCoverX, slant);
    ctx.drawImage(carGloss, carX, carY, carW, carH);
    ctx.restore();
  }

  drawCarAlignedDivider(ctx, carY, carH, carCoverX, slant, dividerT);
  ctx.restore();
}

function drawAbstractCarPanel(ctx: CanvasRenderingContext2D, stage: StageRect) {
  const { px, py, pw, ph, coverX, coverage } = stage;

  ctx.save();
  roundRectPath(ctx, px, py, pw, ph, Math.min(pw, ph) * 0.12);
  ctx.clip();

  ctx.fillStyle = INK.panel;
  ctx.fillRect(px, py, pw, ph);
  const flat = ctx.createLinearGradient(0, py, 0, py + ph);
  flat.addColorStop(0, "rgba(255,255,255,0.05)");
  flat.addColorStop(0.5, "rgba(255,255,255,0.015)");
  flat.addColorStop(1, "rgba(0,0,0,0.2)");
  ctx.fillStyle = flat;
  ctx.fillRect(px, py, pw, ph);

  ctx.fillStyle = "#ffffff";
  for (const d of DUST) {
    ctx.globalAlpha = d.a * (1 - coverage) * 0.5;
    ctx.beginPath();
    ctx.arc(px + d.x * pw, py + d.y * ph, d.r * 1.4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  ctx.save();
  ctx.beginPath();
  ctx.rect(px, py, coverX - px, ph);
  ctx.clip();
  const sheen = ctx.createLinearGradient(px, py, px + pw, py + ph);
  sheen.addColorStop(0, "#3a3b3d");
  sheen.addColorStop(0.42, "#111113");
  sheen.addColorStop(0.5, INK.silverLight);
  sheen.addColorStop(0.58, "#111113");
  sheen.addColorStop(1, "#2c2d2f");
  ctx.fillStyle = sheen;
  ctx.fillRect(px, py, pw, ph);
  ctx.restore();

  drawBeforeAfterDivider(ctx, stage);
  ctx.restore();
}

function drawCarPanel(ctx: CanvasRenderingContext2D, params: CarParams) {
  const { w, h, scale, coverage, applicator, dividerT } = params;
  const pad = w * (1 - scale) * 0.5;
  const stage: StageRect = {
    px: -pad,
    py: h * 0.08 - pad * 0.4,
    pw: w + pad * 2,
    ph: h * 0.86 + pad * 0.8,
    coverX: -pad + (w + pad * 2) * coverage,
    coverage,
    dividerT,
  };

  const carImg = photo(CAR_PHOTO);
  if (carImg) {
    drawRealCarPanel(ctx, carImg, stage);
  } else {
    drawAbstractCarPanel(ctx, stage);
  }

  // The jar itself rides the wipe — the product doing the work, rather than a
  // stand-in applicator shape.
  if (applicator.visible > 0.02) {
    const poteImg = photo(POTE_PHOTO);
    const rect = carImg ? carRect(carImg, stage) : null;
    const cx = stage.px + applicator.x * stage.pw;
    const cy = rect ? rect.carY + rect.carH * 0.26 : stage.py + stage.ph * 0.45;
    const size = (rect ? rect.carH : stage.ph) * 0.34;

    ctx.save();
    ctx.globalAlpha = ctx.globalAlpha * applicator.visible;
    if (poteImg) {
      drawProductPhoto(ctx, poteImg, {
        cx,
        cy,
        height: size,
        tilt: -0.07,
        sweep: 0.5,
        sweepStrength: 0.55,
        glow: 1,
      });
    } else {
      drawProductGlow(ctx, cx, cy, size);
    }
    ctx.restore();
  }
}

/* ------------------------------------------------------------------ sparkle */

function drawSparkles(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  intensity: number,
  frame: number
) {
  if (intensity <= 0.02) return;
  const base = ctx.globalAlpha;
  for (let i = 0; i < SPARKLE.length; i++) {
    const s = SPARKLE[i];
    const pulse = 0.5 + 0.5 * Math.sin(frame * 0.12 + i * 1.7);
    ctx.globalAlpha = base * intensity * pulse * 0.7;
    ctx.beginPath();
    ctx.arc(s.x * w, s.y * h * 0.7 + h * 0.15, s.r * 1.8, 0, Math.PI * 2);
    ctx.fillStyle = INK.silverLight;
    ctx.fill();
  }
  ctx.globalAlpha = base;
}

/* -------------------------------------------------------------- the whole frame */

export function drawPlaceholderFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  frameOneBased: number
) {
  const P = frameP(frameOneBased);

  drawBackdrop(ctx, width, height);

  const midTransition = lerp(BP.spongeEnd, BP.transitionEnd, 0.5);

  // the car hands the frame back to the jar early in the final beat, so the
  // two are never both half-visible on top of each other
  const finalHandover = lerp(BP.beforeAfterEnd, 1, 0.32);

  const productOpacity = keyframes(P, [
    [0, 1],
    [BP.spongeEnd, 1],
    [midTransition, 0],
    [BP.beforeAfterEnd, 0],
    [finalHandover, 1],
    [1, 1],
  ]);

  const carOpacity = keyframes(P, [
    [BP.spongeEnd, 0],
    [midTransition, 1],
    [BP.beforeAfterEnd, 1],
    [finalHandover, 0],
    [1, 0],
  ]);

  if (carOpacity > 0.01) {
    const carScale = keyframes(P, [
      [BP.spongeEnd, 1.55],
      [BP.transitionEnd, 1],
    ]);

    const coverage = keyframes(P, [
      [BP.transitionEnd, 0],
      [BP.applicationEnd, 0.35],
      [BP.shineEnd, 0.6],
      [BP.beforeAfterEnd, 1],
    ]);

    const t1 = lerp(BP.transitionEnd, BP.applicationEnd, 0.15);
    const t2 = lerp(BP.applicationEnd, BP.shineEnd, 0.85);
    const applicatorVisible = keyframes(P, [
      [BP.transitionEnd, 0],
      [t1, 1],
      [t2, 1],
      [BP.shineEnd, 0],
    ]);
    const wobble = Math.sin(P * 90) * 0.025;

    const dividerT = keyframes(P, [
      [BP.shineEnd, 0],
      [BP.shineEnd + 0.008, 1],
      [BP.beforeAfterEnd, 1],
    ]);

    ctx.save();
    ctx.globalAlpha = carOpacity;
    drawCarPanel(ctx, {
      w: width,
      h: height,
      scale: carScale,
      coverage,
      applicator: { visible: applicatorVisible, x: clamp01(coverage + wobble) },
      dividerT,
    });
    drawSparkles(
      ctx,
      width,
      height,
      remap(P, BP.applicationEnd, BP.shineEnd) * carOpacity,
      frameOneBased
    );
    ctx.restore();
  }

  if (productOpacity > 0.01) {
    const isFinal = P >= BP.beforeAfterEnd;
    const finalT = isFinal ? remap(P, BP.beforeAfterEnd, 1) : 0;

    // The opening height matches the hero photo above, so the scroll picks the
    // jar up exactly where the page handed it over and pushes in from there.
    const heightFrac = keyframes(P, [
      [0, 0.34],
      [BP.closedEnd, 0.4],
      [BP.lidEnd, 0.5],
      [BP.pasteEnd, 0.62],
      [BP.spongeEnd, 0.56],
      [midTransition, 0.86],
      [BP.beforeAfterEnd, 0.3],
      [1, 0.4],
    ]);

    const cyFrac = keyframes(P, [
      [0, 0.52],
      [BP.pasteEnd, 0.5],
      [midTransition, 0.48],
      [BP.beforeAfterEnd, 0.44],
      [1, 0.4],
    ]);

    const tilt = keyframes(P, [
      [0, -0.02],
      [BP.lidEnd, 0.015],
      [BP.spongeEnd, -0.01],
      [1, 0],
    ]);

    const sweep = keyframes(P, [
      [0, 0.06],
      [BP.pasteEnd, 0.55],
      [BP.spongeEnd, 0.92],
      [BP.beforeAfterEnd, 0.1],
      [1, 0.6],
    ]);

    const sweepStrength = keyframes(P, [
      [0, 0.25],
      [BP.closedEnd, 0.5],
      [BP.pasteEnd, 1],
      [BP.spongeEnd, 0.7],
      [BP.beforeAfterEnd, 0.6],
      [1, 1],
    ]);

    const glow = keyframes(P, [
      [0, 0.35],
      [BP.lidEnd, 0.7],
      [BP.pasteEnd, 1],
      [BP.spongeEnd, 0.85],
      [BP.beforeAfterEnd, 0.7],
      [1, 1],
    ]);

    const cx = width / 2;
    const cy = height * cyFrac;
    const shotHeight = height * heightFrac * lerp(1, 1.04, smoothstep(finalT));
    const poteImg = photo(POTE_PHOTO);

    ctx.save();
    ctx.globalAlpha = productOpacity;
    if (poteImg) {
      drawProductPhoto(ctx, poteImg, {
        cx,
        cy,
        height: shotHeight,
        tilt,
        sweep,
        sweepStrength,
        glow,
      });
    } else {
      drawProductGlow(ctx, cx, cy, shotHeight);
    }
    drawSparkles(
      ctx,
      width,
      height,
      isFinal ? finalT * 0.6 : remap(P, BP.closedEnd, BP.pasteEnd) * 0.3,
      frameOneBased
    );
    ctx.restore();
  }
}
