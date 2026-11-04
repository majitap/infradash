"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  highPrivilegePending,
  openIncidents,
  openMRs,
  openVulnerabilities,
  pendingRequestCount,
  runnerCounts,
} from "@/lib/mock-data"
import { navGroups, normalizePath } from "@/lib/nav"
import { TONES } from "@/lib/tones"
import { cn } from "@/lib/utils"

const BADGES: Record<string, { value: number; alert?: boolean } | undefined> = {
  "/incidents": { value: openIncidents.length, alert: openIncidents.some((i) => i.severity === "S1") },
  "/merge-requests": { value: openMRs.length },
  "/runners": { value: runnerCounts.offline, alert: runnerCounts.offline > 0 },
  "/security": { value: openVulnerabilities },
  "/access": { value: pendingRequestCount, alert: highPrivilegePending > 0 },
}

export function NavMain() {
  const pathname = normalizePath(usePathname())
  const { setOpenMobile } = useSidebar()

  return (
    <>
      {navGroups.map((group) => (
        <SidebarGroup key={group.label} className="py-1.5">
          <SidebarGroupLabel className="px-2.5 text-[11px] font-semibold tracking-[-0.005em] text-muted-foreground/80">
            {group.label}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {group.items.map((item) => {
                const active = pathname === item.url
                const tone = TONES[item.tone]
                const badge = BADGES[item.url]
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      isActive={active}
                      className={cn(
                        "h-9 gap-2.5 rounded-[11px] px-2 text-[13.5px] font-medium transition-all duration-150",
                        active
                          ? "bg-white! font-semibold text-foreground! shadow-[0_1px_2px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.03)] ring-1 ring-black/[0.05] dark:bg-white/[0.11]! dark:text-white! dark:ring-white/[0.08]"
                          : "text-sidebar-foreground/85 hover:bg-black/[0.04] dark:hover:bg-white/[0.055]"
                      )}
                      render={<Link href={item.url} onClick={() => setOpenMobile(false)} />}
                    >
                      <span
                        className={cn(
                          "flex size-6.5 shrink-0 items-center justify-center rounded-[7.5px] transition-all duration-150",
                          active
                            ? `${tone.bg} text-white shadow-xs`
                            : `${tone.soft} ${tone.text}`
                        )}
                      >
                        <item.icon className="size-3.5 stroke-[2.1]" />
                      </span>
                      <span className="tracking-[-0.01em]">{item.title}</span>
                    </SidebarMenuButton>
                    {badge && badge.value > 0 && (
                      <SidebarMenuBadge
                        className={cn(
                          "right-2 rounded-full px-1.5 py-0.5 text-[10.5px] font-semibold tabular-nums",
                          badge.alert
                            ? "bg-tone-rose/14 text-tone-rose ring-1 ring-tone-rose/20"
                            : active
                              ? "bg-black/[0.06] text-foreground/80 dark:bg-white/[0.14] dark:text-white/90"
                              : "bg-black/[0.05] text-muted-foreground dark:bg-white/[0.07]"
                        )}
                      >
                        {badge.value}
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  )
}
