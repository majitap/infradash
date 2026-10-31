import type { Metadata } from "next"

import { IncidentsView } from "@/components/views/incidents-view"

export const metadata: Metadata = { title: "인시던트" }

export default function IncidentsPage() {
  return <IncidentsView />
}
