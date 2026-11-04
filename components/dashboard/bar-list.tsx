import { cn } from "@/lib/utils"

export type BarListItem = {
  key: string
  label: React.ReactNode
  value: number
  /** text shown at the right; defaults to the formatted value */
  display?: string
  /** per-entity color; omit to use the single series color */
  color?: string
  secondary?: string
}

/**
 * Horizontal Apple capsule bar list for nominal categories.
 */
export function BarList({
  items,
  color = "var(--chart-1)",
  className,
  max,
}: {
  items: BarListItem[]
  color?: string
  className?: string
  max?: number
}) {
  const top = max ?? Math.max(...items.map((i) => i.value), 1)
  return (
    <ul className={cn("flex flex-col gap-3", className)}>
      {items.map((item) => (
        <li key={item.key} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1.5">
          <div className="flex min-w-0 items-center justify-between gap-2 text-[13px]">
            <span className="truncate font-medium text-foreground">{item.label}</span>
            {item.secondary && <span className="shrink-0 text-[11.5px] text-muted-foreground">{item.secondary}</span>}
          </div>
          <span className="text-[13px] font-semibold text-foreground tabular-nums">
            {item.display ?? item.value.toLocaleString("en-US")}
          </span>
          <div className="col-span-2 h-1.5 overflow-hidden rounded-full bg-black/[0.05] dark:bg-white/[0.07]">
            <div
              className="h-full rounded-full transition-[width] duration-300"
              style={{ width: `${Math.max(3, (item.value / top) * 100)}%`, background: item.color ?? color }}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}
