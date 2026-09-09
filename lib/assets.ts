/**
 * Product photography, served straight from this repository through GitHub's
 * raw endpoint and pinned to a commit so the URL is immutable.
 *
 * The originals (1230x1278 for the jar) are larger than the inline payload the
 * deploy tooling accepts, so bundling them would mean shipping a re-encoded,
 * downscaled copy. Linking them keeps the exact bytes the client supplied.
 */
const PHOTO_COMMIT = "a5c5316ca5785e51dac970dfe55d0c899386ff05";
const PHOTO_BASE = `https://raw.githubusercontent.com/MxTxDEV/Poli-Brilho/${PHOTO_COMMIT}/public/product/photos`;

/** Jar of Sabão Polibrilho, 500 g — 1230x1278 original. */
export const POTE_PHOTO = `${PHOTO_BASE}/pote-real.webp`;

/** Black BMW used in the before/after scene — 2000x771 original. */
export const CAR_PHOTO = `${PHOTO_BASE}/bmw-preto.webp`;
