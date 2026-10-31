import type { Metadata } from "next"

import { AuditView } from "@/components/views/audit-view"

export const metadata: Metadata = { title: "감사 로그" }

export default function AuditPage() {
  return <AuditView />
}
