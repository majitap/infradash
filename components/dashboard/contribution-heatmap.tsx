import { fmtDate, fmtWeekday } from "@/lib/format"
import { addDays, weekday, type DailyCommits } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

const LEVEL_CLASS = ["bg-heat-0", "bg-heat-1", "bg-heat-2", "bg-heat-3", "bg-heat-4"]
const ROW_LABELS = ["월", "", "수", "", "금", "", ""]

function levelOf(count: number, max: number) {
  if (count <= 0) return 0
  const r = count / max
  if (r <= 0.25) return 1
  if (r <= 0.5) return 2
  if (r <= 0.75) return 3
  return 4
}

/**
 * Responsive Apple Crystal-Blue contribution matrix that scales cleanly to fit the container width.
 */
export function ContributionHeatmap({ days, className }: { days: DailyCommits[]; className?: string }) {
  if (days.length === 0) return null
  const byDate = new Map(days.map((d) => [d.date, d.count]))
  const max = Math.max(...days.map((d) => d.count), 1)

  const first = days[0].date
  const firstDow = (weekday(first) + 6) % 7
  const start = addDays(first, -firstDow)
  const last = days[days.length - 1].date
  const weeks: string[][] = []
  for (let cursor = start; cursor <= last; cursor = addDays(cursor, 7)) {
    weeks.push(Array.from({ length: 7 }, (_, i) => addDays(cursor, i)))
  }

  let lastLabeled = -10
  const monthLabels = weeks.map((week, i) => {
    const m = Number(week[0].slice(5, 7))
    const prev = i > 0 ? Number(weeks[i - 1][0].slice(5, 7)) : null
    if (m !== prev && i - lastLabeled >= 3) {
      lastLabeled = i
      return `${m}월`
    }
    return ""
  })

  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      <div className="thin-scrollbar overflow-x-auto pb-1">
        <div className="grid min-w-[660px] grid-cols-[auto_1fr] gap-x-2.5 gap-y-1.5">
          <div />
          <div
            className="grid gap-[3px] text-[11px] font-medium text-muted-foreground"
            style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))` }}
          >
            {monthLabels.map((label, i) => (
              <span key={i} className="overflow-visible leading-3 whitespace-nowrap">
                {label}
              </span>
            ))}
          </div>
          <div className="grid grid-rows-7 gap-[3px] text-[10.5px] leading-3 text-muted-foreground">
            {ROW_LABELS.map((label, i) => (
              <span key={i} className="flex items-center">
                {label}
              </span>
            ))}
          </div>
          <div
            className="grid grid-flow-col grid-rows-7 gap-[3px]"
            style={{ gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))` }}
          >
            {weeks.flatMap((week) =>
              week.map((date) => {
                const count = byDate.get(date)
                const future = count === undefined
                return (
                  <span
                    key={date}
                    title={future ? undefined : `${fmtDate(date)} (${fmtWeekday(date)}) · 커밋 ${count}개`}
                    className={cn(
                      "aspect-square w-full rounded-[3.5px] transition-transform duration-150 hover:scale-125",
                      future ? "bg-transparent" : LEVEL_CLASS[levelOf(count, max)]
                    )}
                  />
                )
              })
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end gap-1.5 text-[11px] text-muted-foreground">
        <span>적음</span>
        {LEVEL_CLASS.map((c) => (
          <span key={c} className={cn("size-3 rounded-[3.5px]", c)} />
        ))}
        <span>많음</span>
      </div>
    </div>
  )
}
