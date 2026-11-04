import Link from "next/link"
import { ChevronRightIcon, type LucideIcon } from "lucide-react"

import { Sparkline } from "@/components/dashboard/sparkline"
import { TrendBadge, type Trend } from "@/components/dashboard/trend-badge"
import { Card } from "@/components/ui/card"
import type { Tone } from "@/lib/nav"
import { TONES } from "@/lib/tones"
import { cn } from "@/lib/utils"

type KpiTileProps = {
  label: string
  value: string
  unit?: string
  hint?: string
  trend?: Trend
  icon: LucideIcon
  tone: Tone
  spark?: number[]
  href?: string
  className?: string
}

/**
 * Apple Health / Stocks-inspired Bento Metric Card.
 */
export function KpiTile({ label, value, unit, hint, trend, icon: Icon, tone, spark, href, className }: KpiTileProps) {
  const t = TONES[tone]
  const body = (
    <Card
      size="sm"
      className={cn(
        "group/kpi relative h-full justify-between gap-3.5 rounded-[22px] px-5 py-4.5 transition-all duration-200",
        href &&
          "hover:-translate-y-[1.5px] hover:ring-black/[0.09] hover:shadow-[0_4px_16px_rgba(0,0,0,0.05),0_16px_32px_-8px_rgba(0,0,0,0.06)] dark:hover:ring-white/[0.13] dark:hover:bg-[#1C1E27]",
        className
      )}
    >
      <div className="flex items-center gap-2.5">
        <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-[10px]", t.soft, t.text)}>
          <Icon className="size-4 stroke-[2.1]" />
        </span>
        <span className="min-w-0 flex-1 truncate text-[13px] font-semibold tracking-[-0.01em] text-muted-foreground">
          {label}
        </span>
        {href && (
          <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground/45 transition-all duration-200 group-hover/kpi:translate-x-0.5 group-hover/kpi:text-foreground/75" />
        )}
      </div>

      <div className="flex items-end justify-between gap-3">
        <div className="flex min-w-0 items-baseline gap-1">
          <span className="text-[1.85rem] leading-none font-bold tracking-[-0.035em] whitespace-nowrap text-foreground">
            {value}
          </span>
          {unit && <span className="text-[13.5px] font-medium text-muted-foreground">{unit}</span>}
        </div>
        {spark && spark.length > 1 && (
          <Sparkline data={spark} color={t.cssVar} fill className="h-9 w-24 min-w-14 shrink" />
        )}
      </div>

      {(trend || hint) && (
        <div className="-mt-0.5 flex min-w-0 items-center gap-2 text-[12px] text-muted-foreground">
          {trend && <TrendBadge trend={trend} />}
          {hint && <span className="truncate">{hint}</span>}
        </div>
      )}
    </Card>
  )

  if (href) {
    return (
      <Link href={href} className="block h-full rounded-[22px] outline-none focus-visible:ring-2 focus-visible:ring-ring">
        {body}
      </Link>
    )
  }
  return body
}

export function KpiGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("grid grid-cols-1 gap-4 px-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 lg:px-6", className)}>
      {children}
    </div>
  )
}
