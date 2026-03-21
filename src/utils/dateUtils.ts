import { YEAR_MS } from "../engine/timewaveConstants";

/**
 * Unified date formatting for charts that handles deep time (millions/billions of years)
 * as well as modern UTC dates.
 */
export const formatChartDate = (timeMs: number, showTime: boolean = false): string => {
  const yearsOffset = timeMs / YEAR_MS;
  const year = 1970 + yearsOffset;

  // Handle cosmological/geological timescales
  if (year <= -20e9) return "The Big Bang";
  if (year <= -1e9) {
    return `${Math.abs(year / 1e9).toFixed(1)} Billion Yrs Ago`;
  }
  if (year <= -1e6) {
    return `${Math.abs(year / 1e6).toFixed(1)} Million Yrs Ago`;
  }
  if (year <= -10000) {
    return `${Math.abs(year).toLocaleString(undefined, { maximumFractionDigits: 0 })} Yrs Ago`;
  }

  const d = new Date(timeMs);
  if (isNaN(d.getTime())) {
    return `${Math.abs(year).toLocaleString(undefined, { maximumFractionDigits: 0 })} Yrs Ago`;
  }

  const y = d.getUTCFullYear();
  if (y < 0) return `${Math.abs(y)} BC`;

  if (showTime) {
    return (
      d.toLocaleDateString() +
      " " +
      d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  }

  return d.toLocaleDateString();
};
