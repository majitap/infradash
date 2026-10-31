"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowRightIcon, ServerCogIcon } from "lucide-react"

import { NavMain } from "@/components/layout/nav-main"
import { NavUser } from "@/components/layout/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { upgradePlan } from "@/lib/mock-data"

function VersionCard() {
  const { setOpenMobile } = useSidebar()
  return (
    <Link
      href="/upgrade"
      onClick={() => setOpenMobile(false)}
      className="group/version mx-2 mb-1 flex items-center gap-3 rounded-lg border border-sidebar-border bg-sidebar-accent/60 px-3 py-2 text-xs transition-colors hover:bg-sidebar-accent"
    >
      <span className="relative flex size-2">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-tone-violet opacity-50" />
        <span className="relative inline-flex size-2 rounded-full bg-tone-violet" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col leading-tight">
        <span className="font-bold">GitLab {upgradePlan.currentVersion}</span>
        <span className="truncate text-sidebar-foreground/70">업그레이드 가능 · {upgradePlan.targetVersion}</span>
      </span>
      <ArrowRightIcon className="size-3.5 text-sidebar-foreground/50 transition-transform group-hover/version:translate-x-0.5" />
    </Link>
  )
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="hover:bg-transparent" render={<Link href="/" />}>
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <ServerCogIcon className="size-5" />
              </span>
              <span className="grid flex-1 text-left leading-tight">
                <span className="text-base font-extrabold tracking-tight">InfraDash</span>
                <span className="text-xs text-sidebar-foreground/70">GitLab 운영 콘솔</span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="thin-scrollbar">
        <NavMain />
      </SidebarContent>
      <SidebarFooter>
        <VersionCard />
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
