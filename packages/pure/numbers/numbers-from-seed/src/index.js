/**
 * Generates a deterministic array of pseudo-random numbers from a seed.
 *
 * ---
 *
 * Using the same seed and options produces the same sequence.
 * Values are generated between `0` and `multiplicator`, and can optionally
 * be rounded or sorted.
 *
 * @param count - Number of values to generate.
 * @param seed - Seed used to generate the deterministic sequence.
 * @param trend - Optional sorting direction for the generated values.
 * @param multiplicator - Multiplier applied to each generated value. Defaults to `1`.
 * @param rounded - Whether generated values should be rounded to integers. Defaults to `true`.
 * @returns An array of numbers
 *
 * @example
 * ```ts
 * const numbers = numbersFromSeed({
 *   count: 5,
 *   seed: "example",
 *   trend: "up",
 *   multiplicator: 100,
 * });
 *
 * // Returns the same sequence every time for this seed and config.
 * ```
 *
 * ---
 *
 * Lore: All the flowers of all the tomorrows are in the seeds of today (Native american proverb)
 */
export function numbersFromSeed({ count, seed, trend = null, multiplicator = 1, rounded = true, }) {
    const seedString = String(seed);
    let hash = 2166136261;
    for (let i = 0; i < seedString.length; i += 1) {
        hash ^= seedString.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }
    let state = hash >>> 0;
    const random = () => {
        state += 0x6d2b79f5;
        let t = state;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        const res = (((t ^ (t >>> 14)) >>> 0) / 4294967296) * multiplicator;
        return rounded ? Math.round(res) : res;
    };
    const numbers = Array.from({ length: count }, random);
    if (trend === "up") {
        return numbers.sort((a, b) => a - b);
    }
    if (trend === "down") {
        return numbers.sort((a, b) => b - a);
    }
    return numbers;
}
