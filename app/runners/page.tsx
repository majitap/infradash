import type { Metadata } from "next"

import { RunnersView } from "@/components/views/runners-view"

export const metadata: Metadata = { title: "러너" }

export default function RunnersPage() {
  return <RunnersView />
}
