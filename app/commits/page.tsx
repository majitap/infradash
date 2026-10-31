import type { Metadata } from "next"

import { CommitsView } from "@/components/views/commits-view"

export const metadata: Metadata = { title: "커밋" }

export default function CommitsPage() {
  return <CommitsView />
}
