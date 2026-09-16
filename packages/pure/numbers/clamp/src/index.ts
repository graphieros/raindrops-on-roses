/**
 * Clamps a numeric value between a minimum and maximum bound.
 *
 * ---
 *
 * @param value - The value to clamp
 * @param min - The minimum value
 * @param max - The maximum value
 * @returns The clamped value, between `min` and `max`
 *
 * ---
 *
 * Lore:
 * Procrustes is an innkeeper who forces his guests to sleep in a magical bed whose size fits no one. Either it is too short, in which case Procrustes cuts off whatever parts of the traveler stick out; or it is too long, in which case the innkeeper stretches the limbs of those who lie in it until they match the size of the bed.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
