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
  indigo: { text: "text-tone-indigo", bg: "bg-tone-indigo", soft: "bg-tone-indigo/10 dark:bg-tone-indigo/15", ring: "ring-tone-indigo/22", cssVar: "var(--tone-indigo)" },
  emerald: { text: "text-tone-emerald", bg: "bg-tone-emerald", soft: "bg-tone-emerald/10 dark:bg-tone-emerald/15", ring: "ring-tone-emerald/22", cssVar: "var(--tone-emerald)" },
  amber: { text: "text-tone-amber", bg: "bg-tone-amber", soft: "bg-tone-amber/12 dark:bg-tone-amber/15", ring: "ring-tone-amber/24", cssVar: "var(--tone-amber)" },
  rose: { text: "text-tone-rose", bg: "bg-tone-rose", soft: "bg-tone-rose/10 dark:bg-tone-rose/15", ring: "ring-tone-rose/22", cssVar: "var(--tone-rose)" },
  sky: { text: "text-tone-sky", bg: "bg-tone-sky", soft: "bg-tone-sky/10 dark:bg-tone-sky/15", ring: "ring-tone-sky/22", cssVar: "var(--tone-sky)" },
  violet: { text: "text-tone-violet", bg: "bg-tone-violet", soft: "bg-tone-violet/10 dark:bg-tone-violet/15", ring: "ring-tone-violet/22", cssVar: "var(--tone-violet)" },
  teal: { text: "text-tone-teal", bg: "bg-tone-teal", soft: "bg-tone-teal/10 dark:bg-tone-teal/15", ring: "ring-tone-teal/22", cssVar: "var(--tone-teal)" },
  orange: { text: "text-tone-orange", bg: "bg-tone-orange", soft: "bg-tone-orange/10 dark:bg-tone-orange/15", ring: "ring-tone-orange/22", cssVar: "var(--tone-orange)" },
}

/** status colors for marks and chips; always pair with an icon and a label */
export type Status = "good" | "warning" | "serious" | "critical" | "neutral" | "info"

export const STATUS: Record<Status, { text: string; soft: string; dot: string; cssVar: string }> = {
  good: { text: "text-[#15803d] dark:text-[#4ade80]", soft: "bg-[#28cd41]/12 dark:bg-[#30d158]/16", dot: "bg-status-good", cssVar: "var(--status-good)" },
  warning: { text: "text-[#b45309] dark:text-[#fcd34d]", soft: "bg-[#ff9f0a]/14 dark:bg-[#ffd60a]/16", dot: "bg-status-warning", cssVar: "var(--status-warning)" },
  serious: { text: "text-[#c2410c] dark:text-[#fb923c]", soft: "bg-[#ff6b00]/12 dark:bg-[#ff9f0a]/16", dot: "bg-status-serious", cssVar: "var(--status-serious)" },
  critical: { text: "text-[#dc2626] dark:text-[#ff6961]", soft: "bg-[#ff3b30]/11 dark:bg-[#ff453a]/16", dot: "bg-status-critical", cssVar: "var(--status-critical)" },
  info: { text: "text-[#0066cc] dark:text-[#64d2ff]", soft: "bg-[#007aff]/10 dark:bg-[#0a84ff]/16", dot: "bg-tone-sky", cssVar: "var(--chart-1)" },
  neutral: { text: "text-muted-foreground", soft: "bg-black/[0.045] dark:bg-white/[0.07]", dot: "bg-muted-foreground/60", cssVar: "var(--muted-foreground)" },
}
