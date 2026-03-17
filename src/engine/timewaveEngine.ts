import { TIMEWAVE_DATA } from "./timewaveData";

const DATA_SIZE = 384;
const SCALING_FACTOR = 64;

/**
 * Basic numerical value function w1(i) = w(i mod 384)
 */
function w1(i: number): number {
  const idx = ((Math.floor(i) % DATA_SIZE) + DATA_SIZE) % DATA_SIZE;
  return TIMEWAVE_DATA[idx];
}

/**
 * Linear interpolation function v(x)
 */
export function v(x: number): number {
  if (x < 3) return 0; // Per condition (2) in the mathematical definition

  const intX = Math.floor(x);
  const fracX = x - intX;

  const w_curr = w1(intX);
  const w_next = w1(intX + 1);

  return w_curr + fracX * (w_next - w_curr);
}

/**
 * Fractal transform f(x)
 */
export function f(x: number): number {
  if (x === 0) return 0;

  // Use absolute value to mirror the wave after the zero point (2012)
  const absX = Math.abs(x);
  let sum = 0;

  // i from 0 to infinity (convergence is fast due to 64^i in denominator)
  for (let i = 0; i < 20; i++) {
    const power = Math.pow(SCALING_FACTOR, i);
    sum += v(absX * power) / power;
  }

  // i from -1 to -infinity (sum is finite because v(x) = 0 for x < 3)
  for (let i = -1; i > -100; i--) {
    const power = Math.pow(SCALING_FACTOR, i);
    const value = v(absX * power);
    if (value === 0 && absX * power < 3) break; // Terminated when x * 64^i < 3
    sum += value / power;
  }

  return sum;
}

/**
 * Final timewave function t(x)
 * x = time in days prior to the zero date
 */
export function t(x: number): number {
  if (x <= 0) return 0; // Strictly clamped at or after the zero point
  return f(x) / Math.pow(SCALING_FACTOR, 3);
}

/**
 * Zero date: 2012-12-21 (Midnight UTC)
 */
export const ZERO_DATE = new Date(Date.UTC(2012, 11, 21));

/**
 * Converts a date to "days before zero date" (x)
 */
export function dateToX(date: Date): number {
  const diffMs = ZERO_DATE.getTime() - date.getTime();
  return diffMs / (1000 * 60 * 60 * 24);
}

/**
 * Gets novelty value for a specific date
 */
export function getNoveltyAtDate(date: Date): number {
  const x = dateToX(date);
  return t(x);
}
