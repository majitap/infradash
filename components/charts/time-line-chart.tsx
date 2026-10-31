"use client"

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

import { AXIS_PROPS, GRID_PROPS, seriesConfig, tooltipRow, type Series } from "@/components/charts/common"
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { cn } from "@/lib/utils"

type Props = {
  data: Record<string, string | number>[]
  xKey: string
  series: Series[]
  xFormatter?: (v: string) => string
  valueFormatter?: (v: number) => string
  labelFormatter?: (v: string) => string
  className?: string
  legend?: boolean
  yWidth?: number
}

export function TimeLineChart({
  data,
  xKey,
  series,
  xFormatter = (v) => v,
  valueFormatter = (v) => v.toLocaleString("en-US"),
  labelFormatter,
  className,
  legend = series.length > 1,
  yWidth = 36,
}: Props) {
  const config = seriesConfig(series)
  const row = tooltipRow(config, valueFormatter)

  return (
    <ChartContainer config={config} className={cn("aspect-auto h-60 w-full", className)}>
      <LineChart data={data} margin={{ left: 0, right: 12, top: 12 }}>
        <CartesianGrid {...GRID_PROPS} />
        <XAxis dataKey={xKey} {...AXIS_PROPS} tickFormatter={xFormatter} minTickGap={16} />
        <YAxis {...AXIS_PROPS} width={yWidth} tickFormatter={(v) => valueFormatter(Number(v))} />
        <ChartTooltip
          cursor={{ stroke: "var(--border)" }}
          content={
            <ChartTooltipContent
              labelFormatter={(label) => (labelFormatter ?? xFormatter)(String(label))}
              formatter={row}
            />
          }
        />
        {series.map((s) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            stroke={`var(--color-${s.key})`}
            strokeWidth={2}
            dot={{ r: 2.5, strokeWidth: 0, fill: `var(--color-${s.key})` }}
            activeDot={{ r: 4.5, stroke: "var(--card)", strokeWidth: 2 }}
            isAnimationActive={false}
          />
        ))}
        {legend && <ChartLegend itemSorter={null} content={<ChartLegendContent />} />}
      </LineChart>
    </ChartContainer>
  )
}
