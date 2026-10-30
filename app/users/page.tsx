import type { Metadata } from "next"

import { UsersView } from "@/components/users-view"

export const metadata: Metadata = { title: "Users | InfraDash" }

export default function UsersPage() {
  return <UsersView />
}
