import type { Metadata } from "next"

import { UpgradeView } from "@/components/views/upgrade-view"

export const metadata: Metadata = { title: "업그레이드" }

export default function UpgradePage() {
  return <UpgradeView />
}
