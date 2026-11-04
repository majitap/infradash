"use client"

import { BellIcon, ChevronsUpDownIcon, CircleUserRoundIcon, KeyRoundIcon, LogOutIcon } from "lucide-react"
import { toast } from "sonner"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"
import { initials } from "@/lib/format"
import { currentUser } from "@/lib/mock-data"

export function NavUser() {
  const { isMobile } = useSidebar()
  const user = currentUser

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="mx-0.5 rounded-2xl px-2.5 transition-colors hover:bg-black/[0.04] aria-expanded:bg-black/[0.05] dark:hover:bg-white/[0.06] dark:aria-expanded:bg-white/[0.08]"
              />
            }
          >
            <Avatar className="size-8 rounded-full shadow-2xs ring-1 ring-black/[0.08] dark:ring-white/[0.12]">
              <AvatarFallback className="rounded-full bg-gradient-to-br from-[#0071E3] to-[#5856D6] text-xs font-semibold text-white">
                {initials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-[13px] leading-tight">
              <span className="truncate font-semibold tracking-[-0.01em] text-foreground">{user.name}</span>
              <span className="truncate text-[11.5px] text-muted-foreground">{user.role} · {user.email}</span>
            </div>
            <ChevronsUpDownIcon className="ml-auto size-3.5 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="apple-glass min-w-56 rounded-2xl border-black/[0.08] bg-popover p-1.5 shadow-xl dark:border-white/[0.1]" side={isMobile ? "bottom" : "right"} align="end" sideOffset={6}>
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2.5 px-2 py-1.5 text-left text-sm">
                  <Avatar className="size-8.5 rounded-full">
                    <AvatarFallback className="rounded-full bg-gradient-to-br from-[#0071E3] to-[#5856D6] text-xs font-semibold text-white">
                      {initials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user.role} · {user.email}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className="rounded-lg" onClick={() => toast.info("데모에서는 프로필을 편집할 수 없습니다")}>
                <CircleUserRoundIcon />
                내 프로필
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg" onClick={() => toast.info("데모에서는 토큰을 발급하지 않습니다")}>
                <KeyRoundIcon />
                액세스 토큰
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg" onClick={() => toast.info("알림 설정은 데모에 포함되지 않습니다")}>
                <BellIcon />
                알림 설정
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="rounded-lg" onClick={() => toast("데모 모드: 로그아웃되지 않습니다")}>
              <LogOutIcon />
              로그아웃
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
