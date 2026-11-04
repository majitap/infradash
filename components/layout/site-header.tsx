"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { CalendarIcon, ChevronRightIcon, SearchIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Notifications } from "@/components/layout/notifications"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { useCommandMenu } from "@/components/layout/command-menu"
import { fmtDateFull } from "@/lib/format"
import { MOCK_TODAY, openIncidents } from "@/lib/mock-data"
import { findNavGroup, findNavItem } from "@/lib/nav"
import { TONES } from "@/lib/tones"

export function SiteHeader() {
  const pathname = usePathname()
  const item = findNavItem(pathname)
  const group = findNavGroup(pathname)
  const { setOpen } = useCommandMenu()
  const tone = item ? TONES[item.tone] : TONES.indigo
  const s1Count = openIncidents.filter((i) => i.severity === "S1").length

  return (
    <header className="apple-glass sticky top-0 z-20 flex h-(--header-height) shrink-0 items-center border-b border-black/[0.05] bg-background/75 md:rounded-t-[20px] dark:border-white/[0.06] dark:bg-background/72">
      <div className="flex w-full items-center gap-2 px-4 lg:px-6">
        <SidebarTrigger className="-ml-1.5 rounded-lg text-muted-foreground hover:text-foreground" />
        <Separator orientation="vertical" className="mx-1 h-4 bg-black/[0.08] data-vertical:self-auto dark:bg-white/[0.1]" />

        <div className="flex min-w-0 items-center gap-2.5">
          {item && (
            <span className={`hidden size-7 shrink-0 items-center justify-center rounded-[8px] ${tone.soft} ${tone.text} sm:inline-flex`}>
              <item.icon className="size-3.5 stroke-[2.2]" />
            </span>
          )}
          <div className="flex min-w-0 items-center gap-1.5 text-sm">
            {group && (
              <>
                <span className="hidden text-[13px] font-medium text-muted-foreground md:inline">{group.label}</span>
                <ChevronRightIcon className="hidden size-3.5 text-muted-foreground/50 md:inline" />
              </>
            )}
            <h1 className="truncate text-[15px] font-semibold tracking-[-0.02em] text-foreground">
              {item?.title ?? "InfraDash"}
            </h1>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <Link
            href="/incidents"
            className="hidden items-center gap-1.5 rounded-full border border-black/[0.06] bg-white/80 px-2.5 py-1 text-[12px] font-medium transition-colors hover:bg-white xl:inline-flex dark:border-white/[0.08] dark:bg-white/[0.05] dark:hover:bg-white/[0.09]"
          >
            <span className="relative flex size-2">
              {s1Count > 0 && (
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-status-critical opacity-75" />
              )}
              <span className={`relative inline-flex size-2 rounded-full ${s1Count > 0 ? "bg-status-critical" : "bg-status-good"}`} />
            </span>
            <span className={s1Count > 0 ? "font-semibold text-tone-rose" : "text-muted-foreground"}>
              {s1Count > 0 ? `S1 인시던트 ${s1Count}건` : "시스템 정상"}
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="hidden h-8 w-56 items-center gap-2 rounded-full border border-black/[0.065] bg-black/[0.03] px-3 text-[12.5px] text-muted-foreground transition-all hover:border-black/[0.12] hover:bg-black/[0.05] hover:text-foreground lg:inline-flex dark:border-white/[0.08] dark:bg-white/[0.05] dark:hover:bg-white/[0.09]"
          >
            <SearchIcon className="size-3.5 shrink-0 opacity-75" />
            <span className="flex-1 truncate text-left">Spotlight 검색...</span>
            <Kbd className="rounded-md bg-white/85 px-1.5 text-[10.5px] shadow-2xs dark:bg-white/10">⌘K</Kbd>
          </button>

          <Button variant="ghost" size="icon-sm" aria-label="검색" className="rounded-full lg:hidden" onClick={() => setOpen(true)}>
            <SearchIcon className="size-4" />
          </Button>

          <span className="hidden items-center gap-1.5 rounded-full bg-black/[0.035] px-2.5 py-1 text-[12px] font-medium text-muted-foreground 2xl:inline-flex dark:bg-white/[0.055]">
            <CalendarIcon className="size-3.5 opacity-75" />
            {fmtDateFull(MOCK_TODAY)}
          </span>

          <Notifications />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
