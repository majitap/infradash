import type { LucideIcon } from "lucide-react"

import { STATUS, type Status } from "@/lib/tones"
import { cn } from "@/lib/utils"

/** Status chip: color never carries the meaning alone, there is always an icon or dot plus a label. */
export function StatusPill({
  status,
  label,
  icon: Icon,
  className,
  size = "sm",
}: {
  status: Status
  label: string
  icon?: LucideIcon
  className?: string
  size?: "xs" | "sm"
}) {
  const s = STATUS[status]
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full font-bold whitespace-nowrap",
        size === "xs" ? "px-1.5 py-px text-[11px]" : "px-2 py-0.5 text-xs",
        s.soft,
        s.text,
        className
      )}
    >
      {Icon ? <Icon className={size === "xs" ? "size-3" : "size-3.5"} /> : <span className={cn("size-1.5 rounded-full", s.dot)} />}
      {label}
    </span>
  )
}
