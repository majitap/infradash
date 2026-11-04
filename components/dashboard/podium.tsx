import { CrownIcon, FlameIcon, GitCommitHorizontalIcon } from "lucide-react"

import { RankBadge } from "@/components/dashboard/leaderboard"
import { TrendBadge, trendOf } from "@/components/dashboard/trend-badge"
import { UserAvatar } from "@/components/dashboard/user-avatar"
import { Card } from "@/components/ui/card"
import { fmtInt, fmtPct } from "@/lib/format"
import type { LeaderboardRow } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

function PodiumCard({ row, rank, periodLabel }: { row: LeaderboardRow; rank: number; periodLabel: string }) {
  const trend = trendOf(row.commits, row.previous)
  const first = rank === 1
  return (
    <Card
      className={cn(
        "relative items-center gap-3.5 overflow-hidden px-5 text-center transition-transform duration-200 hover:-translate-y-0.5",
        first
          ? "py-7 ring-1 ring-[#FF9F0A]/35 @3xl/main:order-2"
          : "py-5.5 @3xl/main:order-1",
        rank === 3 && "@3xl/main:order-3"
      )}
    >
      {first && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -top-16 h-36 bg-gradient-to-b from-[#FFD60A]/18 via-[#FF9F0A]/6 to-transparent dark:from-[#FFD60A]/14"
        />
      )}
      <RankBadge rank={rank} className="absolute top-4 left-4" />
      {row.user.streakDays >= 7 && (
        <span className="absolute top-4 right-4 inline-flex items-center gap-0.5 rounded-full bg-tone-orange/10 px-2 py-0.5 text-[11px] font-semibold text-tone-orange">
          <FlameIcon className="size-3" />
          {row.user.streakDays}일 연속
        </span>
      )}
      <div className="relative mt-1">
        <UserAvatar
          name={row.user.name}
          hue={row.user.hue}
          size={first ? "xl" : "lg"}
          className={cn(first && "ring-4 ring-[#FFD60A]/45 shadow-md")}
        />
        {first && (
          <CrownIcon className="absolute -top-3.5 left-1/2 size-6 -translate-x-1/2 -rotate-6 fill-[#FFD60A] text-[#E68600]" />
        )}
      </div>
      <div className="leading-snug">
        <div className={cn("font-bold tracking-[-0.02em] text-foreground", first ? "text-lg" : "text-base")}>{row.user.name}</div>
        <div className="text-xs text-muted-foreground">
          {row.user.department} · {row.user.title}
        </div>
      </div>
      <div className="flex items-baseline gap-1.5">
        <GitCommitHorizontalIcon className="size-4 self-center text-tone-violet" />
        <span className={cn("font-bold tracking-[-0.035em] text-foreground", first ? "text-[2.35rem] leading-none" : "text-3xl leading-none")}>
          {fmtInt(row.commits)}
        </span>
        <span className="text-[13px] font-medium text-muted-foreground">커밋</span>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <TrendBadge trend={trend} muted={row.previous === 0} />
        <span>
          {periodLabel} · 기여 비중 {fmtPct(row.share, 1)}
        </span>
      </div>
    </Card>
  )
}

export function Podium({ rows, periodLabel }: { rows: LeaderboardRow[]; periodLabel: string }) {
  const top = rows.slice(0, 3)
  return (
    <div className="grid grid-cols-1 gap-4 @3xl/main:grid-cols-3 @3xl/main:items-end">
      {top.map((row, i) => (
        <PodiumCard key={row.user.id} row={row} rank={i + 1} periodLabel={periodLabel} />
      ))}
    </div>
  )
}
