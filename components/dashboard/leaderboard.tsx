import { CrownIcon, FlameIcon } from "lucide-react"

import { TrendBadge, trendOf } from "@/components/dashboard/trend-badge"
import { UserAvatar } from "@/components/dashboard/user-avatar"
import { fmtInt } from "@/lib/format"
import type { LeaderboardRow } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

const RANK_STYLE: Record<number, string> = {
  1: "bg-amber-400 text-amber-950 shadow-sm shadow-amber-400/40",
  2: "bg-slate-300 text-slate-800 dark:bg-slate-400 dark:text-slate-900",
  3: "bg-orange-300 text-orange-950 dark:bg-orange-400",
}

export function RankBadge({ rank, className }: { rank: number; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-extrabold tabular-nums",
        RANK_STYLE[rank] ?? "bg-muted text-muted-foreground",
        className
      )}
    >
      {rank}
    </span>
  )
}

export function Leaderboard({
  rows,
  startRank = 1,
  showPrevious = true,
  className,
}: {
  rows: LeaderboardRow[]
  startRank?: number
  showPrevious?: boolean
  className?: string
}) {
  const max = Math.max(...rows.map((r) => r.commits), 1)
  return (
    <ol className={cn("flex flex-col", className)}>
      {rows.map((row, i) => {
        const rank = startRank + i
        const trend = trendOf(row.commits, row.previous)
        return (
          <li
            key={row.user.id}
            className="grid grid-cols-[auto_auto_minmax(0,1fr)_auto] items-center gap-x-3 border-b py-2.5 last:border-b-0"
          >
            <RankBadge rank={rank} />
            <UserAvatar name={row.user.name} hue={row.user.hue} size="sm" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-sm font-bold">{row.user.name}</span>
                {rank === 1 && <CrownIcon className="size-3.5 text-amber-500" />}
                {row.user.streakDays >= 14 && (
                  <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-orange-600 dark:text-orange-300">
                    <FlameIcon className="size-3" />
                    {row.user.streakDays}일
                  </span>
                )}
                <span className="truncate text-xs text-muted-foreground">{row.user.department}</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-tone-violet" style={{ width: `${(row.commits / max) * 100}%` }} />
              </div>
            </div>
            <div className="flex flex-col items-end gap-0.5">
              <span className="text-sm font-extrabold tabular-nums">{fmtInt(row.commits)}</span>
              {showPrevious && <TrendBadge trend={trend} className="px-1 py-0 text-[11px]" muted={row.previous === 0} />}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
