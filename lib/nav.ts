import {
  CircleArrowUpIcon,
  LayoutDashboardIcon,
  ServerIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react"

export type NavItem = {
  title: string
  url: string
  icon: LucideIcon
}

export const navItems: NavItem[] = [
  { title: "Overview", url: "/", icon: LayoutDashboardIcon },
  { title: "Users", url: "/users", icon: UsersIcon },
  { title: "Runners", url: "/runners", icon: ServerIcon },
  { title: "Upgrade", url: "/upgrade", icon: CircleArrowUpIcon },
]

/** usePathname() may carry a trailing slash because of `trailingSlash: true`. */
export function normalizePath(pathname: string | null) {
  if (!pathname || pathname === "/") return "/"
  return pathname.replace(/\/+$/, "")
}

export function findNavItem(pathname: string | null) {
  const path = normalizePath(pathname)
  return navItems.find((item) => item.url === path)
}
