import { ArrowDownRightIcon, ArrowUpRightIcon, MinusIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export type Trend = {
  /** text shown next to the arrow, e.g. "+12.5%" or "+3" */
  label: string
  direction: "up" | "down" | "flat"
  /** whether the move is good news; defaults to up = good */
  positive?: boolean
}

export function TrendBadge({ trend, className, muted }: { trend: Trend; className?: string; muted?: boolean }) {
  const positive = trend.positive ?? trend.direction === "up"
  const Icon = trend.direction === "up" ? ArrowUpRightIcon : trend.direction === "down" ? ArrowDownRightIcon : MinusIcon
  const color =
    trend.direction === "flat" || muted
      ? "bg-muted text-muted-foreground"
      : positive
        ? "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300"
        : "bg-rose-500/12 text-rose-700 dark:text-rose-300"
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-bold whitespace-nowrap tabular-nums", color, className)}>
      <Icon className="size-3.5" />
      {trend.label}
    </span>
  )
}

/** build a Trend from two numbers; `invert` when a decrease is the good direction */
export function trendOf(current: number, previous: number, opts?: { invert?: boolean; pct?: boolean; suffix?: string; digits?: number }) {
  const diff = current - previous
  const epsilon = opts?.digits ? 0.5 / 10 ** opts.digits : opts?.pct ? 0.05 : 0.5
  const direction: Trend["direction"] = Math.abs(diff) < epsilon ? "flat" : diff > 0 ? "up" : "down"
  let label: string
  if (direction === "flat") {
    label = opts?.pct ? "0%" : `0${opts?.suffix ?? ""}`
  } else if (opts?.pct) {
    const pct = previous === 0 ? 0 : (diff / previous) * 100
    label = `${pct > 0 ? "+" : ""}${pct.toFixed(opts.digits ?? 1)}%`
  } else {
    const v = opts?.digits ? diff.toFixed(opts.digits) : Math.round(diff).toLocaleString("en-US")
    label = `${diff > 0 ? "+" : ""}${v}${opts?.suffix ?? ""}`
  }
  const positive = opts?.invert ? direction === "down" : direction === "up"
  return { label, direction, positive } satisfies Trend
}
