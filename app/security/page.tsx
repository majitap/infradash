import type { Metadata } from "next"

import { SecurityView } from "@/components/views/security-view"

export const metadata: Metadata = { title: "보안" }

export default function SecurityPage() {
  return <SecurityView />
}
