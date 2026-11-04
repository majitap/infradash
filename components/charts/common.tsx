"use client"

import type { ChartConfig } from "@/components/ui/chart"

export type Series = { key: string; label: string; color: string }

export function seriesConfig(series: Series[]): ChartConfig {
  return Object.fromEntries(series.map((s) => [s.key, { label: s.label, color: s.color }]))
}

/**
 * Tooltip row renderer that keeps the indicator + label + formatted value layout
 * while letting each chart format its own numbers (minutes, %, GB...).
 */
export function tooltipRow(config: ChartConfig, format: (v: number) => string) {
  const Row = (value: unknown, name: unknown, item: { color?: string; payload?: { fill?: string } }) => {
    const key = String(name)
    const color = item?.payload?.fill ?? item?.color
    return (
      <div className="flex w-full items-center gap-2.5 text-[12.5px]">
        <span className="size-2.5 shrink-0 rounded-full" style={{ background: color }} />
        <span className="text-muted-foreground">{config[key]?.label ?? key}</span>
        <span className="ml-auto pl-3 font-semibold text-foreground tabular-nums">{format(Number(value))}</span>
      </div>
    )
  }
  return Row
}

export const GRID_PROPS = {
  vertical: false,
  stroke: "var(--border)",
  strokeDasharray: "3 3",
  strokeOpacity: 0.85,
} as const

export const AXIS_PROPS = {
  tickLine: false,
  axisLine: false,
  tickMargin: 10,
  fontSize: 11.5,
} as const
