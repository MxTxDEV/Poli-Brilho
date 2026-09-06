/** Draws `img` onto the canvas emulating CSS `object-fit: cover`. */
export function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource & { width: number; height: number },
  width: number,
  height: number
) {
  const imgRatio = img.width / img.height;
  const boxRatio = width / height;

  let drawW = width;
  let drawH = height;

  if (imgRatio > boxRatio) {
    drawH = height;
    drawW = height * imgRatio;
  } else {
    drawW = width;
    drawH = width / imgRatio;
  }

  const dx = (width - drawW) / 2;
  const dy = (height - drawH) / 2;
  ctx.drawImage(img, dx, dy, drawW, drawH);
}

/** Sizes a canvas's backing store for the current devicePixelRatio (capped for performance). */
export function fitCanvasToElement(canvas: HTMLCanvasElement, maxDpr = 2): { width: number; height: number } {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
  const width = Math.max(1, Math.round(rect.width * dpr));
  const height = Math.max(1, Math.round(rect.height * dpr));
  if (canvas.width !== width) canvas.width = width;
  if (canvas.height !== height) canvas.height = height;
  return { width, height };
}
