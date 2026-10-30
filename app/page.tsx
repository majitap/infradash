import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { ChartHeadcount } from "@/components/chart-headcount"
import { SectionCards } from "@/components/section-cards"

export default function OverviewPage() {
  return (
    <>
      <SectionCards />
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @5xl/main:grid-cols-3">
        <div className="@5xl/main:col-span-2">
          <ChartAreaInteractive />
        </div>
        <ChartHeadcount />
      </div>
    </>
  )
}
