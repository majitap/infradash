"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { AXIS_PROPS, GRID_PROPS, seriesConfig, tooltipRow } from "@/components/charts/common"
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { fmtDate, fmtInt } from "@/lib/format"
import type { PipelineDay } from "@/lib/mock-data"

const SERIES = [
  { key: "success", label: "성공", color: "var(--status-good)" },
  { key: "failed", label: "실패", color: "var(--status-critical)" },
]

const RANGES = [
  { value: "90", label: "3개월" },
  { value: "30", label: "30일" },
  { value: "14", label: "14일" },
]

export function usePipelineRange() {
  const [range, setRange] = React.useState("30")
  const control = (
    <ToggleGroup
      multiple={false}
      value={[range]}
      onValueChange={(v) => setRange(v[0] ?? "30")}
      variant="outline"
      size="sm"
      aria-label="기간 선택"
    >
      {RANGES.map((r) => (
        <ToggleGroupItem key={r.value} value={r.value} className="px-3">
          {r.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
  return { range: Number(range), control }
}

export function PipelineAreaChart({ days, className }: { days: PipelineDay[]; className?: string }) {
  const config = seriesConfig(SERIES)
  const row = tooltipRow(config, fmtInt)

  return (
    <ChartContainer config={config} className={className ?? "aspect-auto h-64 w-full"}>
      <AreaChart data={days} margin={{ left: 0, right: 8, top: 8 }}>
        <CartesianGrid {...GRID_PROPS} />
        <XAxis dataKey="date" {...AXIS_PROPS} minTickGap={28} tickFormatter={(v) => fmtDate(String(v))} />
        <YAxis {...AXIS_PROPS} width={36} tickFormatter={(v) => fmtInt(Number(v))} />
        <ChartTooltip
          cursor={{ stroke: "var(--border)" }}
          content={<ChartTooltipContent labelFormatter={(l) => fmtDate(String(l))} formatter={row} />}
        />
        <Area dataKey="success" type="monotone" stackId="a" stroke="var(--color-success)" strokeWidth={2} fill="var(--color-success)" fillOpacity={0.14} isAnimationActive={false} />
        <Area dataKey="failed" type="monotone" stackId="a" stroke="var(--color-failed)" strokeWidth={2} fill="var(--color-failed)" fillOpacity={0.3} isAnimationActive={false} />
        <ChartLegend itemSorter={null} content={<ChartLegendContent />} />
      </AreaChart>
    </ChartContainer>
  )
}
