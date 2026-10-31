import {
  CircleCheckIcon,
  CircleXIcon,
  GitMergeIcon,
  GitPullRequestIcon,
  GitCommitHorizontalIcon,
  ServerOffIcon,
  ShieldAlertIcon,
  SirenIcon,
  TagIcon,
  UserPlusIcon,
  type LucideIcon,
} from "lucide-react"

import { UserAvatar } from "@/components/dashboard/user-avatar"
import { relativeTime } from "@/lib/format"
import type { ActivityItem, ActivityType } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

const META: Record<ActivityType, { icon: LucideIcon; className: string }> = {
  push: { icon: GitCommitHorizontalIcon, className: "bg-tone-violet/12 text-tone-violet" },
  mr_merged: { icon: GitMergeIcon, className: "bg-tone-emerald/12 text-tone-emerald" },
  mr_opened: { icon: GitPullRequestIcon, className: "bg-tone-orange/12 text-tone-orange" },
  pipeline_failed: { icon: CircleXIcon, className: "bg-rose-500/12 text-rose-600 dark:text-rose-300" },
  pipeline_passed: { icon: CircleCheckIcon, className: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300" },
  user_joined: { icon: UserPlusIcon, className: "bg-tone-indigo/12 text-tone-indigo" },
  runner_offline: { icon: ServerOffIcon, className: "bg-amber-500/14 text-amber-700 dark:text-amber-300" },
  incident_resolved: { icon: CircleCheckIcon, className: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300" },
  incident_opened: { icon: SirenIcon, className: "bg-rose-500/12 text-rose-600 dark:text-rose-300" },
  release: { icon: TagIcon, className: "bg-tone-sky/12 text-tone-sky" },
  security: { icon: ShieldAlertIcon, className: "bg-rose-500/12 text-rose-600 dark:text-rose-300" },
}

export function ActivityFeed({ items, className }: { items: ActivityItem[]; className?: string }) {
  return (
    <ol className={cn("relative flex flex-col", className)}>
      <span className="absolute top-3 bottom-3 left-[15px] w-px bg-border" aria-hidden="true" />
      {items.map((item) => {
        const meta = META[item.type]
        return (
          <li key={item.id} className="relative flex gap-3 py-2">
            <span className={cn("relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full ring-4 ring-card", meta.className)}>
              <meta.icon className="size-4" />
            </span>
            <div className="min-w-0 flex-1 leading-snug">
              <p className="text-sm font-medium">{item.text}</p>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                {item.actor && (
                  <span className="inline-flex items-center gap-1">
                    <UserAvatar name={item.actor.name} hue={item.actor.hue} size="xs" className="size-4 text-[9px]" />
                    {item.actor.name}
                  </span>
                )}
                {item.project && <span className="font-mono">{item.project}</span>}
                <span>{relativeTime(item.at)}</span>
              </div>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
