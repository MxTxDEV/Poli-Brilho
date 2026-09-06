export function clamp01(x: number): number {
  return Math.min(1, Math.max(0, x));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function smoothstep(t: number): number {
  const c = clamp01(t);
  return c * c * (3 - 2 * c);
}

/** Maps p from [inMin, inMax] to [0, 1], clamped. */
export function remap(p: number, inMin: number, inMax: number): number {
  if (inMax === inMin) return p < inMin ? 0 : 1;
  return clamp01((p - inMin) / (inMax - inMin));
}

/**
 * Piecewise-smooth interpolation through a sequence of [position, value]
 * keyframes. Positions must be non-decreasing.
 */
export function keyframes(p: number, points: Array<[number, number]>): number {
  if (points.length === 0) return 0;
  if (p <= points[0][0]) return points[0][1];
  const last = points[points.length - 1];
  if (p >= last[0]) return last[1];
  for (let i = 0; i < points.length - 1; i++) {
    const [p0, v0] = points[i];
    const [p1, v1] = points[i + 1];
    if (p >= p0 && p <= p1) {
      const t = smoothstep(remap(p, p0, p1));
      return lerp(v0, v1, t);
    }
  }
  return last[1];
}

/** Deterministic pseudo-random generator (mulberry32) so noise never flickers between renders. */
export function mulberry32(seed: number): () => number {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface Speck {
  x: number;
  y: number;
  r: number;
  a: number;
}

export function seededSpecks(count: number, seed: number): Speck[] {
  const rand = mulberry32(seed);
  const out: Speck[] = [];
  for (let i = 0; i < count; i++) {
    out.push({
      x: rand(),
      y: rand(),
      r: 0.4 + rand() * 1.6,
      a: 0.05 + rand() * 0.35,
    });
  }
  return out;
}
