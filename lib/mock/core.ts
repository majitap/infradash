/**
 * Shared helpers for the mock data modules.
 *
 * Everything is deterministic: a fixed "today" plus a seeded PRNG, so the
 * static export renders identically on the server, in CI and in the browser.
 */

export const MOCK_TODAY = "2026-10-31" // Saturday
export const MOCK_NOW = "2026-10-31T10:12:00"

/** Monday of the current week (weeks run Mon..Sun). */
export const THIS_WEEK_START = "2026-10-26"

export function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export type Rand = () => number

export function pick<T>(rand: Rand, items: readonly T[]): T {
  return items[Math.floor(rand() * items.length)]
}

export function between(rand: Rand, min: number, max: number) {
  return min + rand() * (max - min)
}

export function intBetween(rand: Rand, min: number, max: number) {
  return Math.floor(between(rand, min, max + 1))
}

export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

export function hashString(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export function addDays(isoDate: string, days: number) {
  const d = new Date(`${isoDate.slice(0, 10)}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

export function addMinutes(isoDateTime: string, minutes: number) {
  const d = new Date(`${isoDateTime}Z`)
  d.setUTCMinutes(d.getUTCMinutes() + minutes)
  return d.toISOString().slice(0, 16)
}

/** 0 = Sunday .. 6 = Saturday */
export function weekday(isoDate: string) {
  return new Date(`${isoDate.slice(0, 10)}T00:00:00Z`).getUTCDay()
}

export function daysBetween(fromIso: string, toIso: string) {
  const a = Date.parse(`${fromIso.slice(0, 10)}T00:00:00Z`)
  const b = Date.parse(`${toIso.slice(0, 10)}T00:00:00Z`)
  return Math.round((b - a) / 86400000)
}

/** Start dates (Mondays) of the last 12 weeks, oldest first. Index 11 is this week. */
export const WEEK_STARTS: string[] = Array.from({ length: 12 }, (_, i) =>
  addDays(THIS_WEEK_START, -7 * (11 - i))
)

/** Last 6 months as "YYYY-MM", oldest first. */
export const MONTHS: string[] = ["2026-05", "2026-06", "2026-07", "2026-08", "2026-09", "2026-10"]

/** Last 12 months as "YYYY-MM", oldest first. */
export const MONTHS_12: string[] = [
  "2025-11", "2025-12", "2026-01", "2026-02", "2026-03", "2026-04",
  "2026-05", "2026-06", "2026-07", "2026-08", "2026-09", "2026-10",
]

export function dateTime(isoDate: string, hour: number, minute: number) {
  return `${isoDate}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`
}
