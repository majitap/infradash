import { cn } from "@/lib/utils"

const DAYS = ["월", "화", "수", "목", "금", "토", "일"]
const LEVEL_CLASS = ["bg-heat-0", "bg-heat-1", "bg-heat-2", "bg-heat-3", "bg-heat-4"]

function levelOf(v: number, max: number) {
  if (v <= 0) return 0
  const r = v / max
  return r <= 0.2 ? 1 : r <= 0.45 ? 2 : r <= 0.72 ? 3 : 4
}

/** 7 x 24 grid: when during the week does the team commit. */
export function HourHeatmap({ matrix, className }: { matrix: number[][]; className?: string }) {
  const max = Math.max(...matrix.flat(), 1)
  const peak = matrix.reduce(
    (best, row, d) => {
      row.forEach((v, h) => {
        if (v > best.v) best = { v, d, h }
      })
      return best
    },
    { v: 0, d: 0, h: 0 }
  )
  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      <div className="grid grid-cols-[auto_1fr] gap-x-2.5 gap-y-1">
        <div />
        <div className="grid grid-cols-24 text-[10px] font-medium text-muted-foreground">
          {Array.from({ length: 24 }, (_, h) => (
            <span key={h} className={cn("overflow-visible leading-3 whitespace-nowrap", h % 6 !== 0 && "invisible")}>
              {h}시
            </span>
          ))}
        </div>
        <div className="grid grid-rows-7 gap-[3px] text-[11px] text-muted-foreground">
          {DAYS.map((d) => (
            <span key={d} className="flex items-center leading-none">
              {d}
            </span>
          ))}
        </div>
        <div className="grid grid-rows-7 gap-[3px]">
          {matrix.map((row, d) => (
            <div key={d} className="grid grid-cols-24 gap-[3px]">
              {row.map((v, h) => (
                <span
                  key={h}
                  title={`${DAYS[d]}요일 ${h}시 · 평균 ${v.toFixed(1)}개`}
                  className={cn(
                    "h-4.5 min-w-0 rounded-[3.5px] transition-transform duration-150 hover:scale-115",
                    LEVEL_CLASS[levelOf(v, max)],
                    peak.d === d && peak.h === h && "ring-2 ring-primary/80"
                  )}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between text-[11.5px] text-muted-foreground">
        <span>
          피크 타임: <b className="font-semibold text-foreground">{DAYS[peak.d]}요일 {peak.h}시</b> (평균 {peak.v.toFixed(1)}개)
        </span>
        <span className="flex items-center gap-1.5">
          적음
          {LEVEL_CLASS.map((c) => (
            <span key={c} className={cn("size-3 rounded-[3.5px]", c)} />
          ))}
          많음
        </span>
      </div>
    </div>
  )
}
