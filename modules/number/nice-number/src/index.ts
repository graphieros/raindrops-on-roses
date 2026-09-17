/**
 * Returns a human-friendly number based on the `1`, `2`, `5`, `10` progression
 * scaled to the appropriate power of ten. Useful to produce chart scales, tick itervals, etc.
 *
 * By default, the result is rounded upward so it is greater than or equal to
 * the provided range. When `round` is `true`, the nearest human-friendly value
 * is returned instead.
 *
 * ---
 *
 * @param range - The positive numeric range to convert to a human-friendly value
 * @param round - Whether to return the nearest human-friendly value instead of rounding upward
 * @returns A human-friendly number expressed as `1`, `2`, `5`, or `10` times a power of ten
 *
 * @example
 * ```ts
 * niceNumber(37); // 50
 * niceNumber(23, true); // 20
 *```
 * ---
 *
 * Lore:
We talk about being in our 30s, and our 40s, and our 50s. We don’t talk about being in our 37s.
 */
export function niceNumber(range: number, round = false): number {
  const exponent = Math.floor(Math.log10(range));
  const magnitude = Math.pow(10, exponent);
  const fraction = range / magnitude;
  const epsilon = Number.EPSILON * Math.max(1, Math.abs(fraction));

  let niceFraction: number;

  if (round) {
    if (fraction < 1.5 - epsilon) {
      niceFraction = 1;
    } else if (fraction < 3 - epsilon) {
      niceFraction = 2;
    } else if (fraction < 7 - epsilon) {
      niceFraction = 5;
    } else {
      niceFraction = 10;
    }
  } else {
    if (fraction <= 1 + epsilon) {
      niceFraction = 1;
    } else if (fraction <= 2 + epsilon) {
      niceFraction = 2;
    } else if (fraction <= 5 + epsilon) {
      niceFraction = 5;
    } else {
      niceFraction = 10;
    }
  }

  return niceFraction * magnitude;
}
