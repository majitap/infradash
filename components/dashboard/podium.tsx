import { CrownIcon, GitCommitHorizontalIcon } from "lucide-react"

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
        "relative items-center gap-3 px-4 text-center",
        first ? "py-6 ring-2 ring-amber-400/70 @3xl/main:order-2" : "py-5 @3xl/main:order-1",
        rank === 3 && "@3xl/main:order-3"
      )}
    >
      <RankBadge rank={rank} className="absolute top-3 left-3" />
      <div className="relative">
        <UserAvatar name={row.user.name} hue={row.user.hue} size={first ? "xl" : "lg"} className={cn(first && "ring-4 ring-amber-400/50")} />
        {first && <CrownIcon className="absolute -top-3 left-1/2 size-6 -translate-x-1/2 -rotate-12 fill-amber-400 text-amber-500" />}
      </div>
      <div className="leading-tight">
        <div className={cn("font-extrabold", first ? "text-lg" : "text-base")}>{row.user.name}</div>
        <div className="text-xs text-muted-foreground">
          {row.user.department} · {row.user.title}
        </div>
      </div>
      <div className="flex items-baseline gap-1">
        <GitCommitHorizontalIcon className="size-4 self-center text-tone-violet" />
        <span className={cn("font-extrabold tracking-tight", first ? "text-4xl" : "text-3xl")}>{fmtInt(row.commits)}</span>
        <span className="text-sm text-muted-foreground">커밋</span>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <TrendBadge trend={trend} muted={row.previous === 0} />
        <span>
          {periodLabel} · 팀의 {fmtPct(row.share, 1)}
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
