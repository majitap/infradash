import { LANGUAGE_COLORS } from "@/lib/languages"
import { projectByName } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

/** "group / name" with the language identity dot. */
export function ProjectRef({ name, className, showGroup = true }: { name: string; className?: string; showGroup?: boolean }) {
  const p = projectByName(name)
  return (
    <span className={cn("inline-flex min-w-0 items-center gap-1.5 font-mono text-[13px]", className)}>
      <span className="size-2 shrink-0 rounded-full" style={{ background: LANGUAGE_COLORS[p.language] }} aria-hidden="true" />
      {showGroup && <span className="truncate text-muted-foreground">{p.group}/</span>}
      <span className="truncate font-semibold">{p.name}</span>
    </span>
  )
}

export function LanguageDot({ language, className }: { language: keyof typeof LANGUAGE_COLORS; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs", className)}>
      <span className="size-2 rounded-full" style={{ background: LANGUAGE_COLORS[language] }} aria-hidden="true" />
      {language}
    </span>
  )
}
