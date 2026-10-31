import Link from "next/link"
import type { LucideIcon } from "lucide-react"

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
 * Stat tile: one headline number with its context.
 * The value uses proportional figures on purpose (tabular digits look loose at display sizes).
 */
export function KpiTile({ label, value, unit, hint, trend, icon: Icon, tone, spark, href, className }: KpiTileProps) {
  const t = TONES[tone]
  const body = (
    <Card
      size="sm"
      className={cn(
        "relative h-full gap-3 px-4 py-4 transition-colors",
        href && "hover:bg-muted/40 hover:ring-foreground/15",
        className
      )}
    >
      <div className="flex items-center gap-2.5">
        <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", t.soft, t.text)}>
          <Icon className="size-4" />
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-bold text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-end justify-between gap-3">
        <div className="flex min-w-0 items-baseline gap-1">
          <span className="text-3xl font-extrabold tracking-tight whitespace-nowrap">{value}</span>
          {unit && <span className="text-sm font-bold text-muted-foreground">{unit}</span>}
        </div>
        {spark && spark.length > 1 && (
          <Sparkline data={spark} color={t.cssVar} fill={false} className="h-8 w-24 min-w-14 shrink" />
        )}
      </div>
      {(trend || hint) && (
        <div className="-mt-1 flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
          {trend && <TrendBadge trend={trend} />}
          {hint && <span className="truncate">{hint}</span>}
        </div>
      )}
    </Card>
  )

  if (href) {
    return (
      <Link href={href} className="block h-full rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring">
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
