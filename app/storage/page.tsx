import type { Metadata } from "next"

import { StorageView } from "@/components/views/storage-view"

export const metadata: Metadata = { title: "스토리지" }

export default function StoragePage() {
  return <StorageView />
}
