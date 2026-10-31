import type { Metadata } from "next"

import { MergeRequestsView } from "@/components/views/merge-requests-view"

export const metadata: Metadata = { title: "머지 리퀘스트" }

export default function MergeRequestsPage() {
  return <MergeRequestsView />
}
