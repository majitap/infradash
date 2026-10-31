import type { Metadata } from "next"

import { AccessView } from "@/components/views/access-view"

export const metadata: Metadata = { title: "권한 관리" }

export default function AccessPage() {
  return <AccessView />
}
