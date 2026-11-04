"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { AXIS_PROPS, GRID_PROPS, seriesConfig, tooltipRow } from "@/components/charts/common"
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { fmtDate, fmtInt } from "@/lib/format"
import type { PipelineDay } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

const SERIES = [
  { key: "success", label: "성공", color: "var(--status-good)" },
  { key: "failed", label: "실패", color: "var(--status-critical)" },
]

const RANGES = [
  { value: "14", label: "14일" },
  { value: "30", label: "30일" },
  { value: "90", label: "3개월" },
]

export function usePipelineRange() {
  const [range, setRange] = React.useState("30")
  const control = (
    <div
      role="group"
      aria-label="기간 선택"
      className="inline-flex items-center rounded-[10px] bg-black/[0.05] p-[3px] dark:bg-white/[0.07]"
    >
      {RANGES.map((r) => {
        const active = range === r.value
        return (
          <button
            key={r.value}
            type="button"
            onClick={() => setRange(r.value)}
            className={cn(
              "rounded-[7.5px] px-2.5 py-1 text-[12px] font-medium transition-all duration-150",
              active
                ? "bg-white font-semibold text-foreground shadow-[0_1px_3px_rgba(0,0,0,0.09),0_1px_1px_rgba(0,0,0,0.04)] dark:bg-white/[0.14] dark:text-white"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {r.label}
          </button>
        )
      })}
    </div>
  )
  return { range: Number(range), control }
}

export function PipelineAreaChart({ days, className }: { days: PipelineDay[]; className?: string }) {
  const rawId = React.useId().replace(/[^a-zA-Z0-9_-]/g, "")
  const config = seriesConfig(SERIES)
  const row = tooltipRow(config, fmtInt)

  return (
    <ChartContainer config={config} className={className ?? "aspect-auto h-64 w-full"}>
      <AreaChart data={days} margin={{ left: 0, right: 8, top: 10 }}>
        <defs>
          <linearGradient id={`pipe-ok-${rawId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-success)" stopOpacity={0.28} />
            <stop offset="95%" stopColor="var(--color-success)" stopOpacity={0.01} />
          </linearGradient>
          <linearGradient id={`pipe-fail-${rawId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-failed)" stopOpacity={0.34} />
            <stop offset="95%" stopColor="var(--color-failed)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid {...GRID_PROPS} />
        <XAxis dataKey="date" {...AXIS_PROPS} minTickGap={28} tickFormatter={(v) => fmtDate(String(v))} />
        <YAxis {...AXIS_PROPS} width={38} tickFormatter={(v) => fmtInt(Number(v))} />
        <ChartTooltip
          cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
          content={<ChartTooltipContent labelFormatter={(l) => fmtDate(String(l))} formatter={row} />}
        />
        <Area
          dataKey="success"
          type="monotone"
          stackId="a"
          stroke="var(--color-success)"
          strokeWidth={2.2}
          fill={`url(#pipe-ok-${rawId})`}
          isAnimationActive={false}
        />
        <Area
          dataKey="failed"
          type="monotone"
          stackId="a"
          stroke="var(--color-failed)"
          strokeWidth={2}
          fill={`url(#pipe-fail-${rawId})`}
          isAnimationActive={false}
        />
        <ChartLegend itemSorter={null} content={<ChartLegendContent />} />
      </AreaChart>
    </ChartContainer>
  )
}
