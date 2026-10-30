"use client"

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { headcountTrend } from "@/lib/mock-data"

const chartConfig = {
  joiners: { label: "Joiners", color: "var(--primary)" },
  leavers: { label: "Leavers", color: "var(--chart-2)" },
} satisfies ChartConfig

function formatMonth(value: string) {
  return new Date(`${value}-01T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    timeZone: "UTC",
  })
}

export function ChartHeadcount() {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Joiners and Leavers</CardTitle>
        <CardDescription>Accounts created and deactivated per month</CardDescription>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <BarChart data={headcountTrend}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={formatMonth}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => formatMonth(String(value))}
                  indicator="dashed"
                />
              }
            />
            <Bar dataKey="joiners" fill="var(--color-joiners)" radius={4} />
            <Bar dataKey="leavers" fill="var(--color-leavers)" radius={4} />
            <ChartLegend content={<ChartLegendContent />} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
