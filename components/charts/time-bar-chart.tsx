"use client"

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts"

import { AXIS_PROPS, GRID_PROPS, seriesConfig, tooltipRow, type Series } from "@/components/charts/common"
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { cn } from "@/lib/utils"

export type ChartRow = Record<string, string | number>

type Props = {
  data: ChartRow[]
  xKey: string
  series: Series[]
  stacked?: boolean
  xFormatter?: (v: string) => string
  valueFormatter?: (v: number) => string
  labelFormatter?: (v: string) => string
  /** draw the last bar at full strength and the rest softer (single series only) */
  highlightLast?: boolean
  className?: string
  legend?: boolean
  yWidth?: number
}

export function TimeBarChart({
  data,
  xKey,
  series,
  stacked = false,
  xFormatter = (v) => v,
  valueFormatter = (v) => v.toLocaleString("en-US"),
  labelFormatter,
  highlightLast = false,
  className,
  legend = series.length > 1,
  yWidth = 36,
}: Props) {
  const config = seriesConfig(series)
  const row = tooltipRow(config, valueFormatter)

  return (
    <ChartContainer config={config} className={cn("aspect-auto h-60 w-full", className)}>
      <BarChart data={data} barCategoryGap={stacked ? "28%" : "22%"} barGap={2} margin={{ left: 0, right: 4, top: 8 }}>
        <CartesianGrid {...GRID_PROPS} />
        <XAxis dataKey={xKey} {...AXIS_PROPS} tickFormatter={xFormatter} minTickGap={16} />
        <YAxis {...AXIS_PROPS} width={yWidth} tickFormatter={(v) => valueFormatter(Number(v))} />
        <ChartTooltip
          cursor={{ fill: "var(--muted)", fillOpacity: 0.6 }}
          content={
            <ChartTooltipContent
              labelFormatter={(label) => (labelFormatter ?? xFormatter)(String(label))}
              formatter={row}
            />
          }
        />
        {series.map((s, idx) => (
          <Bar
            key={s.key}
            dataKey={s.key}
            stackId={stacked ? "stack" : undefined}
            fill={`var(--color-${s.key})`}
            radius={stacked ? (idx === series.length - 1 ? [4, 4, 0, 0] : 0) : [4, 4, 0, 0]}
            stroke={stacked ? "var(--card)" : undefined}
            strokeWidth={stacked ? 1.5 : 0}
            maxBarSize={44}
            isAnimationActive={false}
          >
            {highlightLast && series.length === 1
              ? data.map((_, i) => <Cell key={i} fillOpacity={i === data.length - 1 ? 1 : 0.45} />)
              : null}
          </Bar>
        ))}
        {legend && <ChartLegend itemSorter={null} content={<ChartLegendContent />} />}
      </BarChart>
    </ChartContainer>
  )
}
