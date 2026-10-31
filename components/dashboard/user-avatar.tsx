import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { initials } from "@/lib/format"
import { cn } from "@/lib/utils"

type UserAvatarProps = {
  name: string
  hue: number
  className?: string
  size?: "xs" | "sm" | "md" | "lg" | "xl"
}

const SIZES = {
  xs: "size-6 text-[11px]",
  sm: "size-7 text-xs",
  md: "size-9 text-sm",
  lg: "size-12 text-base",
  xl: "size-16 text-xl",
}

/** Initials avatar colored from the user's own hue, so the same person always gets the same color. */
export function UserAvatar({ name, hue, className, size = "md" }: UserAvatarProps) {
  return (
    <Avatar className={cn("rounded-full", SIZES[size], className)} style={{ "--h": hue } as React.CSSProperties}>
      <AvatarFallback className="rounded-full bg-[oklch(0.9_0.07_var(--h))] font-bold text-[oklch(0.38_0.12_var(--h))] dark:bg-[oklch(0.36_0.08_var(--h))] dark:text-[oklch(0.92_0.07_var(--h))]">
        {initials(name)}
      </AvatarFallback>
    </Avatar>
  )
}

export function UserCell({
  name,
  hue,
  secondary,
  size = "md",
}: {
  name: string
  hue: number
  secondary?: string
  size?: UserAvatarProps["size"]
}) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <UserAvatar name={name} hue={hue} size={size} />
      <div className="min-w-0 leading-tight">
        <div className="truncate font-bold">{name}</div>
        {secondary && <div className="truncate text-xs text-muted-foreground">{secondary}</div>}
      </div>
    </div>
  )
}
