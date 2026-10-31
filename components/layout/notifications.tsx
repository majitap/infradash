"use client"

import * as React from "react"
import { BellIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { relativeTime } from "@/lib/format"
import { notifications } from "@/lib/mock-data"
import { STATUS } from "@/lib/tones"

export function Notifications() {
  const [read, setRead] = React.useState(false)
  const unread = read ? 0 : notifications.length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon-sm" aria-label={`알림 ${unread}건`} className="relative" />}
      >
        <BellIcon className="size-4" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-tone-rose opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-tone-rose" />
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>알림</span>
          <span className="text-xs font-normal text-muted-foreground">{unread}건 읽지 않음</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {notifications.map((n) => (
            <DropdownMenuItem key={n.id} className="items-start gap-3 py-2">
              <span className={`mt-1.5 size-2 shrink-0 rounded-full ${STATUS[n.tone].dot}`} />
              <div className="grid min-w-0 flex-1 gap-0.5">
                <span className="truncate font-medium">{n.title}</span>
                <span className="truncate text-xs text-muted-foreground">{n.body}</span>
                <span className="text-xs text-muted-foreground/80">{relativeTime(n.at)}</span>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="justify-center text-sm"
          onClick={() => {
            setRead(true)
            toast.success("모든 알림을 읽음으로 표시했습니다")
          }}
        >
          모두 읽음으로 표시
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
