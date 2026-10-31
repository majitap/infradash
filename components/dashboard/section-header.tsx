import { cn } from "@/lib/utils"

/** In-page section heading used between card rows. */
export function SectionHeader({
  title,
  description,
  action,
  className,
}: {
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-2 px-4 lg:px-6", className)}>
      <div>
        <h2 className="text-lg font-extrabold tracking-tight">{title}</h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  )
}

/** Horizontal page padding wrapper. */
export function Section({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("px-4 lg:px-6", className)}>{children}</div>
}
