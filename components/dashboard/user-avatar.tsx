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
  md: "size-8.5 text-[13px]",
  lg: "size-12 text-base",
  xl: "size-16 text-xl",
}

/** Apple Contacts-style pastel-gradient initials avatar colored from the user's deterministic hue. */
export function UserAvatar({ name, hue, className, size = "md" }: UserAvatarProps) {
  return (
    <Avatar
      className={cn("rounded-full ring-1 ring-black/[0.06] dark:ring-white/[0.1]", SIZES[size], className)}
      style={{ "--h": hue } as React.CSSProperties}
    >
      <AvatarFallback className="rounded-full bg-[oklch(0.92_0.055_var(--h))] font-semibold text-[oklch(0.35_0.12_var(--h))] dark:bg-[oklch(0.34_0.08_var(--h))] dark:text-[oklch(0.92_0.06_var(--h))]">
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
        <div className="truncate text-[13.5px] font-semibold tracking-[-0.01em] text-foreground">{name}</div>
        {secondary && <div className="truncate text-[11.5px] text-muted-foreground">{secondary}</div>}
      </div>
    </div>
  )
}
