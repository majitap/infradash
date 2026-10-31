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
 * Horizontal bar list for nominal categories. One color for the whole list
 * unless each item carries its own identity color.
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
    <ul className={cn("flex flex-col gap-2.5", className)}>
      {items.map((item) => (
        <li key={item.key} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1">
          <div className="flex min-w-0 items-center justify-between gap-2 text-sm">
            <span className="truncate font-medium">{item.label}</span>
            {item.secondary && <span className="shrink-0 text-xs text-muted-foreground">{item.secondary}</span>}
          </div>
          <span className="text-sm font-bold tabular-nums">{item.display ?? item.value.toLocaleString("en-US")}</span>
          <div className="col-span-2 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full transition-[width]"
              style={{ width: `${Math.max(2, (item.value / top) * 100)}%`, background: item.color ?? color }}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}
