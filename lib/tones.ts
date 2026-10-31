import type { Tone } from "@/lib/nav"

export type ToneStyle = {
  /** text color in the tone */
  text: string
  /** solid background */
  bg: string
  /** translucent background for chips and icon wells */
  soft: string
  /** translucent ring */
  ring: string
  /** CSS variable reference for inline styles and charts */
  cssVar: string
}

export const TONES: Record<Tone, ToneStyle> = {
  indigo: { text: "text-tone-indigo", bg: "bg-tone-indigo", soft: "bg-tone-indigo/12", ring: "ring-tone-indigo/30", cssVar: "var(--tone-indigo)" },
  emerald: { text: "text-tone-emerald", bg: "bg-tone-emerald", soft: "bg-tone-emerald/12", ring: "ring-tone-emerald/30", cssVar: "var(--tone-emerald)" },
  amber: { text: "text-tone-amber", bg: "bg-tone-amber", soft: "bg-tone-amber/14", ring: "ring-tone-amber/30", cssVar: "var(--tone-amber)" },
  rose: { text: "text-tone-rose", bg: "bg-tone-rose", soft: "bg-tone-rose/12", ring: "ring-tone-rose/30", cssVar: "var(--tone-rose)" },
  sky: { text: "text-tone-sky", bg: "bg-tone-sky", soft: "bg-tone-sky/12", ring: "ring-tone-sky/30", cssVar: "var(--tone-sky)" },
  violet: { text: "text-tone-violet", bg: "bg-tone-violet", soft: "bg-tone-violet/12", ring: "ring-tone-violet/30", cssVar: "var(--tone-violet)" },
  teal: { text: "text-tone-teal", bg: "bg-tone-teal", soft: "bg-tone-teal/12", ring: "ring-tone-teal/30", cssVar: "var(--tone-teal)" },
  orange: { text: "text-tone-orange", bg: "bg-tone-orange", soft: "bg-tone-orange/12", ring: "ring-tone-orange/30", cssVar: "var(--tone-orange)" },
}

/** status colors for marks and chips; always pair with an icon and a label */
export type Status = "good" | "warning" | "serious" | "critical" | "neutral" | "info"

export const STATUS: Record<Status, { text: string; soft: string; dot: string; cssVar: string }> = {
  good: { text: "text-emerald-700 dark:text-emerald-300", soft: "bg-emerald-500/12", dot: "bg-status-good", cssVar: "var(--status-good)" },
  warning: { text: "text-amber-700 dark:text-amber-300", soft: "bg-amber-500/14", dot: "bg-status-warning", cssVar: "var(--status-warning)" },
  serious: { text: "text-orange-700 dark:text-orange-300", soft: "bg-orange-500/14", dot: "bg-status-serious", cssVar: "var(--status-serious)" },
  critical: { text: "text-rose-700 dark:text-rose-300", soft: "bg-rose-500/12", dot: "bg-status-critical", cssVar: "var(--status-critical)" },
  info: { text: "text-sky-700 dark:text-sky-300", soft: "bg-sky-500/12", dot: "bg-sky-500", cssVar: "var(--chart-1)" },
  neutral: { text: "text-muted-foreground", soft: "bg-muted", dot: "bg-muted-foreground/60", cssVar: "var(--muted-foreground)" },
}
