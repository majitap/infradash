"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowUpRightIcon, CommandIcon } from "lucide-react"

import { NavMain } from "@/components/layout/nav-main"
import { NavUser } from "@/components/layout/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { preUpgradeChecks, upgradePlan, upgradeSteps } from "@/lib/mock-data"

function VersionUpdateWidget() {
  const { setOpenMobile } = useSidebar()
  const allChecks = [...preUpgradeChecks, ...upgradeSteps.flatMap((s) => s.checklist)]
  const doneCount = allChecks.filter((c) => c.done).length
  const pct = Math.round((doneCount / allChecks.length) * 100)

  return (
    <Link
      href="/upgrade"
      onClick={() => setOpenMobile(false)}
      className="group/version mx-1.5 mb-1 flex flex-col gap-2 rounded-2xl bg-white/75 p-3 text-xs ring-1 ring-black/[0.055] shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all duration-200 hover:bg-white hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] dark:bg-white/[0.055] dark:ring-white/[0.07] dark:hover:bg-white/[0.085]"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-tone-violet opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-tone-violet" />
          </span>
          <span className="font-semibold tracking-tight text-foreground">소프트웨어 업데이트</span>
        </div>
        <ArrowUpRightIcon className="size-3.5 text-muted-foreground transition-transform duration-200 group-hover/version:translate-x-0.5 group-hover/version:-translate-y-0.5" />
      </div>
      <div className="flex items-baseline justify-between font-mono text-[11.5px]">
        <span className="text-muted-foreground">{upgradePlan.currentVersion}</span>
        <span className="font-semibold text-tone-violet">→ {upgradePlan.targetVersion}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-black/[0.06] dark:bg-white/[0.08]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-tone-indigo to-tone-violet transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </Link>
  )
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { setOpenMobile } = useSidebar()
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="px-3 pt-3 pb-1.5">
        <SidebarMenu>
          <SidebarMenuItem>
            <Link
              href="/"
              onClick={() => setOpenMobile(false)}
              className="group flex items-center gap-3 rounded-2xl px-2 py-1.5 transition-colors hover:bg-black/[0.035] dark:hover:bg-white/[0.05]"
            >
              <span className="relative flex size-9.5 shrink-0 items-center justify-center rounded-[11px] bg-gradient-to-br from-[#007AFF] via-[#5856D6] to-[#AF52DE] text-white shadow-[0_4px_12px_-2px_rgba(88,86,214,0.45),inset_0_1px_0_rgba(255,255,255,0.35)] transition-transform duration-200 group-hover:scale-[1.03]">
                <CommandIcon className="size-4.5 stroke-[2.2]" />
              </span>
              <div className="flex min-w-0 flex-1 flex-col leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="text-[15.5px] font-bold tracking-[-0.025em] text-foreground">InfraDash</span>
                  <span className="rounded-full bg-black/[0.06] px-1.5 py-0.5 text-[9.5px] font-semibold tracking-wide text-muted-foreground uppercase dark:bg-white/[0.1]">
                    EE
                  </span>
                </div>
                <span className="truncate text-[11.5px] text-muted-foreground">GitLab Control Plane</span>
              </div>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="thin-scrollbar px-1.5">
        <NavMain />
      </SidebarContent>
      <SidebarFooter className="px-2 pb-2.5">
        <VersionUpdateWidget />
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
