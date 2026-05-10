import { SPESEN_RATES } from "./spesen-rates";
import { round2 } from "./calculations";

export type SpesenInput = {
  startTime?: string | null; // "HH:MM"
  endTime?: string | null; // "HH:MM"
  overnight: boolean;
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
  people: number;
};

export type SpesenBreakdown = {
  baseAllowance: number;
  reason: string;
  breakfastDeduction: number;
  lunchDeduction: number;
  dinnerDeduction: number;
  perPerson: number;
  people: number;
  total: number;
};

function parseHHMM(value?: string | null): number | null {
  if (!value) return null;
  const m = value.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (Number.isNaN(h) || Number.isNaN(min)) return null;
  return h * 60 + min;
}

function durationMinutes(start: string | null | undefined, end: string | null | undefined): number {
  const s = parseHHMM(start);
  const e = parseHHMM(end);
  if (s == null || e == null) return 0;
  let diff = e - s;
  if (diff < 0) diff += 24 * 60; // crossed midnight
  return diff;
}

export function calculateSpesen(input: SpesenInput): SpesenBreakdown {
  const { fullAllowance, smallAllowance, breakfastReductionPct, lunchReductionPct, dinnerReductionPct } =
    SPESEN_RATES;

  const minutes = durationMinutes(input.startTime, input.endTime);
  const hours = minutes / 60;

  let base = 0;
  let reason = "Keine Pauschale (≤ 8 Stunden, keine Übernachtung)";

  if (input.overnight) {
    // Arrival/departure with overnight = small allowance each. The user
    // logs one travel day at a time, so we credit one small allowance.
    base = smallAllowance;
    reason = "Anreise- bzw. Abreisetag mit Übernachtung";
  } else if (hours >= 24) {
    base = fullAllowance;
    reason = "Voller Reisetag (24 Stunden)";
  } else if (hours > 8) {
    base = smallAllowance;
    reason = "Mehr als 8 Stunden Abwesenheit";
  }

  const referenceForDeductions = fullAllowance;
  const breakfastDeduction = input.breakfast ? (referenceForDeductions * breakfastReductionPct) / 100 : 0;
  const lunchDeduction = input.lunch ? (referenceForDeductions * lunchReductionPct) / 100 : 0;
  const dinnerDeduction = input.dinner ? (referenceForDeductions * dinnerReductionPct) / 100 : 0;

  const perPersonRaw = base - breakfastDeduction - lunchDeduction - dinnerDeduction;
  const perPerson = Math.max(0, round2(perPersonRaw));
  const people = Math.max(1, Math.floor(input.people || 1));
  const total = round2(perPerson * people);

  return {
    baseAllowance: round2(base),
    reason,
    breakfastDeduction: round2(breakfastDeduction),
    lunchDeduction: round2(lunchDeduction),
    dinnerDeduction: round2(dinnerDeduction),
    perPerson,
    people,
    total,
  };
}
