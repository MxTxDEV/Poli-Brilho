import { FRAME_COUNT, SCENES } from "./frames";
import { clamp01, keyframes, lerp, remap, seededSpecks, smoothstep } from "./interpolate";

/**
 * Procedural stand-in for the real photographed/rendered frame sequence.
 *
 * `useFrameSequence` calls `drawPlaceholderFrame` whenever a real frame
 * image for the current index isn't available yet. It reproduces the full
 * nine-beat choreography (jar → lid → paste → sponge → car → shine →
 * before/after → final) as flat vector shapes so the scroll experience,
 * timing and pacing can be built, reviewed and shipped before real
 * photography/render frames exist. Swap in `/public/product/frames/*.webp`
 * at any time — nothing else in the app needs to change.
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
  matte: "#28282b",
  silverDark: "#6b6d70",
  silver: "#c7c9cc",
  silverLight: "#f2f3f4",
  white: "#f6f6f4",
};

function drawBackdrop(ctx: CanvasRenderingContext2D, w: number, h: number, p: number) {
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
  void p;
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

interface JarParams {
  cx: number;
  cy: number;
  scale: number;
  lidLift: number; // 0 seated, 1 fully off
  lidWobble: number; // twisting phase
  lidBesideT: number; // 0 hovering above, 1 resting beside (final scene)
  pasteReveal: number; // 0..1
  spongeAttach: number; // 0..1
  unit: number;
}

function drawJarGroup(ctx: CanvasRenderingContext2D, params: JarParams) {
  const { cx, cy, scale, lidLift, lidWobble, lidBesideT, pasteReveal, spongeAttach } = params;
  const u = params.unit * scale;

  const bodyW = u * 1.9;
  const bodyH = u * 2.5;
  const bodyX = cx - bodyW / 2;
  const bodyY = cy - bodyH / 2 + u * 0.35;

  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.6)";
  ctx.shadowBlur = u * 0.35;
  ctx.shadowOffsetY = u * 0.18;
  ctx.beginPath();
  ctx.ellipse(cx, bodyY + bodyH + u * 0.05, bodyW * 0.42, u * 0.14, 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  ctx.fill();
  ctx.restore();

  // jar body
  const bodyGrad = ctx.createLinearGradient(bodyX, 0, bodyX + bodyW, 0);
  bodyGrad.addColorStop(0, "#050505");
  bodyGrad.addColorStop(0.42, INK.matte);
  bodyGrad.addColorStop(0.58, INK.matte);
  bodyGrad.addColorStop(1, "#050505");
  roundRectPath(ctx, bodyX, bodyY, bodyW, bodyH, u * 0.2);
  ctx.fillStyle = bodyGrad;
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.06)";
  ctx.lineWidth = Math.max(1, u * 0.01);
  ctx.stroke();

  // label plate
  const labelW = bodyW * 0.82;
  const labelH = bodyH * 0.34;
  const labelX = cx - labelW / 2;
  const labelY = bodyY + bodyH * 0.4;
  roundRectPath(ctx, labelX, labelY, labelW, labelH, u * 0.08);
  ctx.fillStyle = "#020202";
  ctx.fill();
  ctx.strokeStyle = "rgba(200,201,204,0.35)";
  ctx.lineWidth = Math.max(1, u * 0.008);
  ctx.stroke();

  const chrome = ctx.createLinearGradient(0, labelY, 0, labelY + labelH * 0.5);
  chrome.addColorStop(0, INK.silverLight);
  chrome.addColorStop(0.5, INK.silverDark);
  chrome.addColorStop(1, INK.silver);
  ctx.fillStyle = chrome;
  ctx.textAlign = "center";
  ctx.font = `900 ${Math.round(u * 0.14)}px Arial, Helvetica, sans-serif`;
  ctx.fillText("POLIBRILHO", cx, labelY + labelH * 0.46);
  ctx.font = `600 ${Math.round(u * 0.065)}px Arial, Helvetica, sans-serif`;
  ctx.fillStyle = "rgba(200,201,204,0.75)";
  ctx.fillText("500 G", cx, labelY + labelH * 0.75);

  // creamy paste mounded at the mouth
  if (pasteReveal > 0.02) {
    const domeW = bodyW * 0.74;
    const domeH = u * 0.34 * pasteReveal + u * 0.03;
    const domeY = bodyY + u * 0.02 - domeH * 0.35;

    ctx.save();
    ctx.beginPath();
    ctx.rect(bodyX, 0, bodyW, domeY + domeH * 1.15);
    ctx.clip();

    const paste = ctx.createRadialGradient(
      cx - domeW * 0.18,
      domeY - domeH * 0.4,
      u * 0.02,
      cx,
      domeY,
      domeW * 0.6
    );
    paste.addColorStop(0, INK.silverLight);
    paste.addColorStop(0.5, "#e6e6e4");
    paste.addColorStop(1, "#a9aaa7");
    ctx.fillStyle = paste;
    ctx.beginPath();
    ctx.ellipse(cx, domeY, domeW / 2, domeH, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = Math.max(1, u * 0.01);
    ctx.beginPath();
    ctx.moveTo(cx - domeW * 0.28, domeY - domeH * 0.1);
    ctx.quadraticCurveTo(cx, domeY - domeH * 0.55, cx + domeW * 0.28, domeY - domeH * 0.1);
    ctx.stroke();
    ctx.restore();
  }

  // sponge resting on paste
  if (spongeAttach > 0.01) {
    const sx = cx + bodyW * 0.28;
    const sy = bodyY - u * 0.14 - spongeAttach * u * 0.08;
    drawSponge(ctx, sx, sy, u * 0.62, spongeAttach, 0.15);
  }

  // lid
  const restBesideX = cx + bodyW * 0.95;
  const liftedY = bodyY - u * (0.55 + lidLift * 1.35);
  const lidX = lerp(cx, restBesideX, smoothstep(lidBesideT));
  const lidY = lerp(liftedY, cy + bodyH * 0.34, smoothstep(lidBesideT));
  const lidW = bodyW * lerp(1, 0.62, smoothstep(lidBesideT));
  const lidH = u * 0.42 * lerp(1, 0.7, smoothstep(lidBesideT));

  ctx.save();
  ctx.translate(lidX, lidY);
  ctx.rotate(lidBesideT > 0.5 ? -0.55 : Math.sin(lidWobble) * 0.05 * (1 - lidLift * 0.4));
  const lidGrad = ctx.createLinearGradient(-lidW / 2, 0, lidW / 2, 0);
  lidGrad.addColorStop(0, "#050505");
  lidGrad.addColorStop(0.4, "#3a3a3d");
  lidGrad.addColorStop(0.5, "#4c4c4f");
  lidGrad.addColorStop(0.6, "#3a3a3d");
  lidGrad.addColorStop(1, "#050505");
  roundRectPath(ctx, -lidW / 2, -lidH / 2, lidW, lidH, lidH * 0.28);
  ctx.fillStyle = lidGrad;
  ctx.fill();

  // rotating thread ridges (fakes the twist-off motion in 2D)
  ctx.save();
  roundRectPath(ctx, -lidW / 2, -lidH / 2, lidW, lidH, lidH * 0.28);
  ctx.clip();
  const ridgeCount = 14;
  const phase = (lidWobble * 2.4) % 1;
  ctx.strokeStyle = "rgba(0,0,0,0.45)";
  ctx.lineWidth = Math.max(1, lidW * 0.012);
  for (let i = -2; i <= ridgeCount + 2; i++) {
    const rx = -lidW / 2 + ((i + phase) / ridgeCount) * lidW;
    ctx.beginPath();
    ctx.moveTo(rx, -lidH / 2);
    ctx.lineTo(rx, lidH / 2);
    ctx.stroke();
  }
  ctx.restore();
  ctx.restore();
}

function drawSponge(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  attach: number,
  rotation: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  const w = size;
  const h = size * 0.58;
  roundRectPath(ctx, -w / 2, -h / 2, w, h, h * 0.42);
  const grad = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
  grad.addColorStop(0, "#e9e8e4");
  grad.addColorStop(1, "#b7b6b0");
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.25)";
  ctx.lineWidth = Math.max(1, size * 0.012);
  ctx.stroke();

  if (attach > 0.05) {
    ctx.beginPath();
    ctx.ellipse(-w * 0.1, -h * 0.05, w * 0.28 * attach, h * 0.32 * attach, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(246,246,244,0.95)";
    ctx.fill();
  }
  ctx.restore();
}

interface CarParams {
  p: number;
  w: number;
  h: number;
  scale: number;
  coverage: number; // 0..1 glossy fraction from the left
  sponge: { visible: number; x: number };
  dividerT: number; // 0 hidden -> 1 shown (before/after handle)
}

function drawCarPanel(ctx: CanvasRenderingContext2D, params: CarParams) {
  const { w, h, scale, coverage, sponge, dividerT } = params;
  const pad = w * (1 - scale) * 0.5;
  const px = -pad;
  const py = h * 0.08 - pad * 0.4;
  const pw = w + pad * 2;
  const ph = h * 0.86 + pad * 0.8;

  ctx.save();
  roundRectPath(ctx, px, py, pw, ph, Math.min(pw, ph) * 0.12);
  ctx.clip();

  // matte base ("antes")
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

  // glossy region ("depois") revealed left-to-right
  const coverX = px + pw * coverage;
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

  const mirror = ctx.createLinearGradient(px, py, px, py + ph);
  mirror.addColorStop(0, "rgba(255,255,255,0.28)");
  mirror.addColorStop(0.35, "rgba(255,255,255,0.02)");
  mirror.addColorStop(0.65, "rgba(255,255,255,0.02)");
  mirror.addColorStop(1, "rgba(255,255,255,0.12)");
  ctx.fillStyle = mirror;
  ctx.fillRect(px, py, pw, ph);
  ctx.restore();

  // subtle body lines to read as a car surface
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = Math.max(1, pw * 0.0022);
  ctx.beginPath();
  ctx.moveTo(px + pw * 0.05, py + ph * 0.62);
  ctx.quadraticCurveTo(px + pw * 0.5, py + ph * 0.5, px + pw * 0.97, py + ph * 0.6);
  ctx.stroke();

  ctx.strokeStyle = "rgba(0,0,0,0.35)";
  ctx.beginPath();
  ctx.moveTo(px + pw * 0.62, py);
  ctx.lineTo(px + pw * 0.66, py + ph);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(px + pw * 0.14, py + ph * 1.02, pw * 0.13, Math.PI, 0);
  ctx.strokeStyle = "rgba(0,0,0,0.5)";
  ctx.lineWidth = Math.max(1, pw * 0.006);
  ctx.stroke();

  // before/after divider handle
  if (dividerT > 0.02) {
    ctx.globalAlpha = dividerT;
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
    ctx.globalAlpha = 1;
  }

  ctx.restore();

  if (sponge.visible > 0.02) {
    const sx = px + sponge.x * pw;
    const sy = py + ph * 0.5;
    ctx.globalAlpha = sponge.visible;
    drawSponge(ctx, sx, sy, Math.min(pw, ph) * 0.16, 0.4, 0.12);
    ctx.globalAlpha = 1;
  }
}

function drawSparkles(ctx: CanvasRenderingContext2D, w: number, h: number, intensity: number, frame: number) {
  if (intensity <= 0.02) return;
  for (let i = 0; i < SPARKLE.length; i++) {
    const s = SPARKLE[i];
    const pulse = 0.5 + 0.5 * Math.sin(frame * 0.12 + i * 1.7);
    ctx.globalAlpha = intensity * pulse * 0.7;
    ctx.beginPath();
    ctx.arc(s.x * w, s.y * h * 0.7 + h * 0.15, s.r * 1.8, 0, Math.PI * 2);
    ctx.fillStyle = INK.silverLight;
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

export function drawPlaceholderFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  frameOneBased: number
) {
  const P = frameP(frameOneBased);

  drawBackdrop(ctx, width, height, P);

  const midTransition = lerp(BP.spongeEnd, BP.transitionEnd, 0.5);

  const productOpacity = keyframes(P, [
    [0, 1],
    [BP.spongeEnd, 1],
    [midTransition, 0],
    [BP.beforeAfterEnd, 0],
    [1, 1],
  ]);

  const carOpacity = keyframes(P, [
    [BP.spongeEnd, 0],
    [midTransition, 1],
    [BP.beforeAfterEnd, 1],
    [1, 0],
  ]);

  if (carOpacity > 0.01) {
    const transitionT = remap(P, BP.spongeEnd, BP.transitionEnd);
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
    const spongeVisible = keyframes(P, [
      [BP.transitionEnd, 0],
      [t1, 1],
      [t2, 1],
      [BP.shineEnd, 0],
    ]);
    const wobble = Math.sin(P * 90) * 0.025;
    const spongeX = clamp01(coverage + wobble);

    const dividerT = keyframes(P, [
      [BP.shineEnd, 0],
      [BP.shineEnd + 0.008, 1],
      [BP.beforeAfterEnd, 1],
    ]);

    ctx.save();
    ctx.globalAlpha = carOpacity;
    drawCarPanel(ctx, {
      p: P,
      w: width,
      h: height,
      scale: carScale,
      coverage,
      sponge: { visible: spongeVisible, x: spongeX },
      dividerT,
    });
    drawSparkles(ctx, width, height, remap(P, BP.applicationEnd, BP.shineEnd) * carOpacity, frameOneBased);
    ctx.restore();
    void transitionT;
  }

  if (productOpacity > 0.01) {
    const isFinal = P >= BP.beforeAfterEnd;

    const jarScale = keyframes(P, [
      [0, 0.8],
      [BP.closedEnd, 0.92],
      [BP.lidEnd, 1.02],
      [BP.pasteEnd, 1.22],
      [BP.spongeEnd, 1.14],
      [1, 1.02],
    ]);

    const lidLift = keyframes(P, [
      [0, 0],
      [BP.closedEnd, 0],
      [BP.lidEnd, 1],
      [1, 1],
    ]);

    const pasteReveal = keyframes(P, [
      [BP.closedEnd, 0],
      [BP.lidEnd, 0.45],
      [BP.pasteEnd, 1],
      [BP.spongeEnd, 0.82],
      [1, 0.92],
    ]);

    const spongeAttach = keyframes(P, [
      [BP.pasteEnd, 0],
      [BP.spongeEnd, 1],
      [BP.transitionEnd, 0],
    ]);

    const lidBesideT = isFinal ? remap(P, BP.beforeAfterEnd, 1) : 0;
    const finalT = isFinal ? remap(P, BP.beforeAfterEnd, 1) : 0;
    const cyFrac = lerp(0.6, 0.4, smoothstep(finalT));

    ctx.save();
    ctx.globalAlpha = productOpacity;
    drawJarGroup(ctx, {
      cx: width / 2,
      cy: height * cyFrac,
      scale: jarScale * lerp(1, 0.82, smoothstep(finalT)),
      lidLift,
      lidWobble: P * 26,
      lidBesideT,
      pasteReveal,
      spongeAttach,
      unit: Math.min(width, height) * 0.19,
    });
    drawSparkles(ctx, width, height, isFinal ? remap(P, BP.beforeAfterEnd, 1) * 0.6 : 0, frameOneBased);
    ctx.restore();
  }
}
