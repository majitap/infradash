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
        <SidebarGroup key={group.label}>
          <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {group.items.map((item) => {
                const active = pathname === item.url
                const tone = TONES[item.tone]
                const badge = BADGES[item.url]
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      isActive={active}
                      className="h-9 gap-2.5 font-medium data-[active=true]:font-bold"
                      render={<Link href={item.url} onClick={() => setOpenMobile(false)} />}
                    >
                      <span
                        className={cn(
                          "flex size-6 shrink-0 items-center justify-center rounded-md transition-colors",
                          active ? `${tone.soft} ${tone.text}` : "text-sidebar-foreground/70"
                        )}
                      >
                        <item.icon className="size-4" />
                      </span>
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                    {badge && badge.value > 0 && (
                      <SidebarMenuBadge
                        className={cn(
                          "rounded-full px-1.5 text-[11px] font-bold tabular-nums",
                          badge.alert ? "bg-tone-rose/15 text-tone-rose" : "bg-sidebar-accent text-sidebar-foreground/80"
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
