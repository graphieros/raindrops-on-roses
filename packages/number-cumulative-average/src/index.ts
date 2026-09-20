export type CumulativeAverageConfig = {
  keepInvalid?: boolean;
  convertInvalidToZero?: boolean;
};

export type CumulativeAverageParams<T = unknown> = {
  values: T[];
  config?: CumulativeAverageConfig;
};

/**
 * Calculates the cumulative average of the provided values.
 *
 * ---
 *
 * Invalid values are values for which `Number.isFinite()` returns `false`.
 * Depending on the configuration, they can be preserved, discarded, or
 * treated as zero when calculating the average.
 *
 * @param params - The cumulative average parameters.
 * @param params.values - The values to process.
 * @param params.config - Options controlling how invalid values are handled.
 * @returns An array containing the cumulative averages and, when configured,
 * preserved invalid values.
 *
 * @example
 * ```ts
 * cumulativeAverage({
 *     values: [1, 2, 3],
 * }) // [1, 1.5, 2]
 *```
 *
 * @example
 * ```ts
 * cumulativeAverage({
 *     values: [1, null, 3],
 *     config: { keepInvalid: true },
 * }) // [1, null, 2]
 *```
 *
 * @example
 * ```ts
 * cumulativeAverage({
 *     values: [1, null, 3],
 *     config: { keepInvalid: true, convertInvalidToZero: true },
 * }) // [1, 0.5, 1.3333333333333333]
 *```
 * ---
 *
 * Lore:
 * Every new experience changes ever so slightly the average that came before.
 */
export function cumulativeAverage<T = unknown>({
  values,
  config = {},
}: CumulativeAverageParams<T>): Array<number | T> {
  const { keepInvalid = true, convertInvalidToZero = false } = config;

  const result: Array<number | T> = [];
  let sum = 0;
  let count = 0;

  for (const value of values) {
    const valid = Number.isFinite(value);

    if (!valid && !keepInvalid) continue;

    if (!valid && !convertInvalidToZero) {
      result.push(value);
      continue;
    }

    sum += valid ? (value as number) : 0;
    result.push(sum / ++count);
  }

  return result;
}
