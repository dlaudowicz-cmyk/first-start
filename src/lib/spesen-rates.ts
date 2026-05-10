/**
 * German per-diem (Verpflegungsmehraufwand / "Spesen") rates.
 *
 * These match the standard domestic Germany rates as of 2024+. Update here
 * when the law changes — all calculations read from this file.
 *
 * Rules implemented in `src/lib/spesen.ts`:
 *  - >8h same-day absence: smallAllowance
 *  - full day (24h absence): fullAllowance
 *  - arrival/departure with overnight stay: smallAllowance each
 *  - subtract breakfast (20% of fullAllowance) if provided
 *  - subtract lunch (40% of fullAllowance) if provided
 *  - subtract dinner (40% of fullAllowance) if provided
 *  - allowance never goes below 0
 */
export const SPESEN_RATES = {
  fullAllowance: 28, // 24h absence (Germany domestic)
  smallAllowance: 14, // >8h or arrival/departure day
  breakfastReductionPct: 20,
  lunchReductionPct: 40,
  dinnerReductionPct: 40,
  currency: "EUR",
} as const;

export type SpesenRates = typeof SPESEN_RATES;
