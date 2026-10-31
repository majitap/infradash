"use client"

import { usePathname } from "next/navigation"
import { CalendarIcon, SearchIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Notifications } from "@/components/layout/notifications"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { useCommandMenu } from "@/components/layout/command-menu"
import { fmtDateFull } from "@/lib/format"
import { MOCK_TODAY } from "@/lib/mock-data"
import { findNavItem } from "@/lib/nav"
import { TONES } from "@/lib/tones"

export function SiteHeader() {
  const item = findNavItem(usePathname())
  const { setOpen } = useCommandMenu()
  const tone = item ? TONES[item.tone] : TONES.indigo

  return (
    <header className="sticky top-0 z-20 flex h-(--header-height) shrink-0 items-center border-b bg-background/85 backdrop-blur-md supports-backdrop-filter:bg-background/70 md:rounded-t-xl">
      <div className="flex w-full items-center gap-2 px-4 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-1 h-5 data-vertical:self-auto" />
        <div className="flex min-w-0 items-center gap-2.5">
          {item && (
            <span className={`hidden size-7 items-center justify-center rounded-lg ${tone.soft} ${tone.text} sm:inline-flex`}>
              <item.icon className="size-4" />
            </span>
          )}
          <div className="flex min-w-0 flex-col leading-tight">
            <h1 className="truncate text-base font-bold">{item?.title ?? "InfraDash"}</h1>
            <p className="hidden truncate text-xs text-muted-foreground md:block">
              {item?.description ?? "GitLab 운영 콘솔"}
            </p>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOpen(true)}
            className="hidden w-60 justify-start gap-2 text-muted-foreground lg:inline-flex"
          >
            <SearchIcon className="size-4" />
            <span className="flex-1 text-left">검색 또는 바로 이동</span>
            <Kbd>⌘K</Kbd>
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="검색" className="lg:hidden" onClick={() => setOpen(true)}>
            <SearchIcon className="size-4" />
          </Button>
          <Badge variant="outline" className="hidden gap-1.5 text-muted-foreground xl:inline-flex">
            <CalendarIcon className="size-3.5" />
            {fmtDateFull(MOCK_TODAY)} 기준
          </Badge>
          <Badge variant="secondary" className="hidden md:inline-flex">
            모의 데이터
          </Badge>
          <Notifications />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
