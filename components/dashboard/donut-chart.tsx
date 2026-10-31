"use client"

import { Pie, PieChart } from "recharts"

import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { cn } from "@/lib/utils"

export type DonutDatum = { key: string; label: string; value: number; color: string; display?: string }

/**
 * Part-to-whole donut (max 6 segments) with the legend rendered as an HTML
 * list, so every value is readable without hovering.
 */
export function DonutChart({
  data,
  centerLabel,
  centerValue,
  className,
  legend = "right",
  formatValue = (v) => v.toLocaleString("en-US"),
}: {
  data: DonutDatum[]
  centerLabel?: string
  centerValue?: string
  className?: string
  legend?: "right" | "bottom" | "none"
  formatValue?: (v: number) => string
}) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1
  const config = Object.fromEntries(data.map((d) => [d.key, { label: d.label, color: d.color }])) satisfies ChartConfig
  const chartData = data.map((d) => ({ name: d.key, value: d.value, fill: d.color }))

  return (
    <div className={cn("@container flex items-center gap-4", legend === "bottom" ? "flex-col" : "flex-col @md:flex-row", className)}>
      <div className="relative size-44 shrink-0">
        <ChartContainer config={config} className="aspect-square h-full w-full">
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent nameKey="name" hideLabel formatter={(value, name) => (
                <div className="flex flex-1 items-center justify-between gap-3">
                  <span className="text-muted-foreground">{config[String(name)]?.label ?? name}</span>
                  <span className="font-bold tabular-nums">{formatValue(Number(value))}</span>
                </div>
              )} />}
            />
            <Pie data={chartData} dataKey="value" nameKey="name" innerRadius="66%" outerRadius="100%" paddingAngle={2.5} cornerRadius={3} strokeWidth={0} isAnimationActive={false} />
          </PieChart>
        </ChartContainer>
        {(centerLabel || centerValue) && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center leading-tight">
            {centerValue && <span className="text-2xl font-extrabold tracking-tight">{centerValue}</span>}
            {centerLabel && <span className="text-xs text-muted-foreground">{centerLabel}</span>}
          </div>
        )}
      </div>
      {legend !== "none" && (
        <ul className={cn("grid min-w-0 flex-1 gap-1.5 text-sm", legend === "bottom" && "w-full grid-cols-1 @md:grid-cols-2")}>
          {data.map((d) => (
            <li key={d.key} className="flex items-center gap-2">
              <span className="size-2.5 shrink-0 rounded-[3px]" style={{ background: d.color }} />
              <span className="min-w-0 flex-1 truncate">{d.label}</span>
              <span className="font-bold tabular-nums">{d.display ?? formatValue(d.value)}</span>
              <span className="w-10 text-right text-xs text-muted-foreground tabular-nums">{((d.value / total) * 100).toFixed(0)}%</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
