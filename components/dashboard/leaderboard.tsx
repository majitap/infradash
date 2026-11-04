import { CrownIcon, FlameIcon } from "lucide-react"

import { TrendBadge, trendOf } from "@/components/dashboard/trend-badge"
import { UserAvatar } from "@/components/dashboard/user-avatar"
import { fmtInt } from "@/lib/format"
import type { LeaderboardRow } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

const RANK_STYLE: Record<number, string> = {
  1: "bg-gradient-to-br from-[#FFD60A] to-[#FF9F0A] text-[#3A2200] shadow-xs",
  2: "bg-gradient-to-br from-[#E5E5EA] to-[#AEAEB2] text-[#1C1C1E]",
  3: "bg-gradient-to-br from-[#FDBA74] to-[#EA580C] text-white",
}

export function RankBadge({ rank, className }: { rank: number; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex size-6 shrink-0 items-center justify-center rounded-full text-[11.5px] font-bold tabular-nums",
        RANK_STYLE[rank] ?? "bg-black/[0.045] text-muted-foreground dark:bg-white/[0.07]",
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
            className="grid grid-cols-[auto_auto_minmax(0,1fr)_auto] items-center gap-x-3 border-b border-black/[0.045] py-2.5 last:border-b-0 dark:border-white/[0.055]"
          >
            <RankBadge rank={rank} />
            <UserAvatar name={row.user.name} hue={row.user.hue} size="sm" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-[13.5px] font-semibold tracking-[-0.01em] text-foreground">{row.user.name}</span>
                {rank === 1 && <CrownIcon className="size-3.5 text-amber-500" />}
                {row.user.streakDays >= 14 && (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-tone-orange/10 px-1.5 py-px text-[10.5px] font-semibold text-tone-orange">
                    <FlameIcon className="size-2.5" />
                    {row.user.streakDays}일
                  </span>
                )}
                <span className="truncate text-xs text-muted-foreground">{row.user.department}</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-black/[0.05] dark:bg-white/[0.07]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-tone-indigo to-tone-violet transition-[width] duration-300"
                  style={{ width: `${(row.commits / max) * 100}%` }}
                />
              </div>
            </div>
            <div className="flex flex-col items-end gap-0.5">
              <span className="text-[14px] font-bold tracking-[-0.02em] text-foreground tabular-nums">{fmtInt(row.commits)}</span>
              {showPrevious && <TrendBadge trend={trend} className="px-1.5 py-0 text-[10.5px]" muted={row.previous === 0} />}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
