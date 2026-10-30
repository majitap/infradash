import type { Metadata } from "next"

import { UpgradeView } from "@/components/upgrade-view"

export const metadata: Metadata = { title: "Upgrade | InfraDash" }

export default function UpgradePage() {
  return <UpgradeView />
}
