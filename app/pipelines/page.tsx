import type { Metadata } from "next"

import { PipelinesView } from "@/components/views/pipelines-view"

export const metadata: Metadata = { title: "파이프라인" }

export default function PipelinesPage() {
  return <PipelinesView />
}
