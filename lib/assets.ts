/**
 * Product photography, served straight from this repository through GitHub's
 * raw endpoint and pinned to a commit so the URL is immutable.
 *
 * The originals (1230x1278 for the jar) are larger than the inline payload the
 * deploy tooling accepts, so bundling them would mean shipping a re-encoded,
 * downscaled copy. Linking them keeps the exact bytes the client supplied.
 */
const PHOTO_COMMIT = "c26d7ff72e16d0c23dd32b5d5789d7f9fe29c1b2";
const PHOTO_BASE = `https://raw.githubusercontent.com/MxTxDEV/Poli-Brilho/${PHOTO_COMMIT}/public/product/photos`;

/** Jar of Sabão Polibrilho, 500 g — 1230x1278 original. */
export const POTE_PHOTO = `${PHOTO_BASE}/pote-real.webp`;

/** Black BMW used in the before/after scene — 694x230 original. */
export const CAR_PHOTO = `${PHOTO_BASE}/bmw-preto.webp`;
