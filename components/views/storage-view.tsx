"use client"

import { toast } from "sonner"
import { ArchiveIcon, BrushCleaningIcon, DatabaseIcon, HardDriveIcon, TrendingUpIcon } from "lucide-react"

import { TimeBarChart } from "@/components/charts/time-bar-chart"
import { DonutChart } from "@/components/dashboard/donut-chart"
import { KpiGrid, KpiTile } from "@/components/dashboard/kpi-tile"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { fmtMonth, fmtPct, fmtSize } from "@/lib/format"
import {
  STORAGE_KINDS,
  cleanupCandidates,
  cleanupTotalMb,
  monthlyStorage,
  storageByKind,
  storageGrowth30dMb,
  storageQuotaMb,
  storageTotalMb,
  topStorageProjects,
  type StorageKind,
} from "@/lib/mock-data"

/** one color per storage kind, shared by every chart on the page */
const KIND_COLOR: Record<StorageKind, string> = {
  repository: "var(--chart-1)",
  artifacts: "var(--chart-2)",
  registry: "var(--chart-3)",
  lfs: "var(--chart-4)",
  packages: "var(--chart-5)",
  wiki: "var(--chart-6)",
  uploads: "var(--chart-6)",
}

const SERIES = STORAGE_KINDS.map((k) => ({ key: k.key, label: k.label, color: KIND_COLOR[k.key] }))

function StackedBar({ row, max }: { row: (typeof topStorageProjects)[number]; max: number }) {
  return (
    <div className="flex h-3 gap-px overflow-hidden rounded-full bg-muted" style={{ width: `${(row.total / max) * 100}%` }}>
      {STORAGE_KINDS.map((k) => {
        const v = row[k.key as keyof typeof row] as number
        if (!v) return null
        return <div key={k.key} title={`${k.label} ${fmtSize(v)}`} style={{ width: `${(v / row.total) * 100}%`, background: KIND_COLOR[k.key] }} />
      })}
    </div>
  )
}

export function StorageView() {
  const usedPct = (storageTotalMb / storageQuotaMb) * 100
  const maxProject = Math.max(...topStorageProjects.map((p) => p.total))

  return (
    <>
      <KpiGrid>
        <KpiTile
          label="총 사용량"
          value={fmtSize(storageTotalMb)}
          hint={`할당량 ${fmtSize(storageQuotaMb)}의 ${fmtPct(usedPct, 0)}`}
          icon={HardDriveIcon}
          tone={usedPct > 80 ? "amber" : "indigo"}
          spark={monthlyStorage.map((m) => STORAGE_KINDS.reduce((s, k) => s + m[k.key], 0))}
        />
        <KpiTile
          label="30일 증가"
          value={fmtSize(storageGrowth30dMb)}
          hint="아티팩트와 레지스트리가 대부분"
          icon={TrendingUpIcon}
          tone="orange"
        />
        <KpiTile label="정리 가능" value={fmtSize(cleanupTotalMb)} hint={`${cleanupCandidates.length}개 항목 · 보존 정책 적용 시`} icon={BrushCleaningIcon} tone="emerald" />
        <KpiTile
          label="가장 큰 유형"
          value={storageByKind.reduce((a, b) => (b.mb > a.mb ? b : a)).label}
          hint={fmtSize(Math.max(...storageByKind.map((k) => k.mb)))}
          icon={DatabaseIcon}
          tone="sky"
        />
      </KpiGrid>

      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @5xl/main:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>유형별 사용량</CardTitle>
            <CardDescription>전체 프로젝트 합계</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div>
              <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
                <span>할당량 사용</span>
                <span className="tabular-nums">
                  {fmtSize(storageTotalMb)} / {fmtSize(storageQuotaMb)}
                </span>
              </div>
              <div className="flex h-2.5 gap-px overflow-hidden rounded-full bg-muted">
                {storageByKind.map((k) => (
                  <div key={k.key} style={{ width: `${(k.mb / storageQuotaMb) * 100}%`, background: KIND_COLOR[k.key] }} />
                ))}
              </div>
            </div>
            <DonutChart
              data={storageByKind.map((k) => ({ key: k.key, label: k.label, value: k.mb, color: KIND_COLOR[k.key] }))}
              centerValue={fmtSize(storageTotalMb)}
              centerLabel="사용 중"
              legend="bottom"
              formatValue={fmtSize}
            />
          </CardContent>
        </Card>
        <Card className="@5xl/main:col-span-2">
          <CardHeader>
            <CardTitle>월별 사용량 추이</CardTitle>
            <CardDescription>유형별 누적 (GB) · 최근 12개월</CardDescription>
          </CardHeader>
          <CardContent>
            <TimeBarChart
              data={monthlyStorage}
              xKey="month"
              series={SERIES}
              stacked
              xFormatter={fmtMonth}
              labelFormatter={(m) => `${m.slice(0, 4)}년 ${fmtMonth(m)}`}
              valueFormatter={(v) => `${Math.round(v)} GB`}
              yWidth={64}
              className="h-72"
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @5xl/main:grid-cols-3">
        <Card className="@5xl/main:col-span-2">
          <CardHeader>
            <CardTitle>프로젝트별 사용량</CardTitle>
            <CardDescription>상위 10개 · 막대 색상은 위 차트와 같은 유형 구분</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-3">
              {topStorageProjects.map((p) => (
                <li key={p.project} className="grid grid-cols-[minmax(0,12rem)_1fr_auto] items-center gap-3">
                  <div className="min-w-0 leading-tight">
                    <div className="flex items-center gap-1.5 font-mono text-[13px] font-semibold">
                      <span className="truncate">{p.project}</span>
                      {p.archived && <ArchiveIcon className="size-3 shrink-0 text-muted-foreground" />}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">{p.group}</div>
                  </div>
                  <StackedBar row={p} max={maxProject} />
                  <span className="w-16 text-right text-sm font-bold tabular-nums">{fmtSize(p.total)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {STORAGE_KINDS.map((k) => (
                <span key={k.key} className="inline-flex items-center gap-1.5">
                  <span className="size-2.5 rounded-[3px]" style={{ background: KIND_COLOR[k.key] }} />
                  {k.label}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>정리 후보</CardTitle>
            <CardDescription>회수 가능 {fmtSize(cleanupTotalMb)}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {cleanupCandidates.map((c) => (
              <div key={c.label} className="flex items-center gap-3 rounded-lg border px-3 py-2.5">
                <span className="size-2.5 shrink-0 rounded-[3px]" style={{ background: KIND_COLOR[c.kind] }} />
                <div className="min-w-0 flex-1 leading-tight">
                  <div className="truncate text-sm font-bold">{c.label}</div>
                  <div className="truncate text-xs text-muted-foreground">{c.action}</div>
                </div>
                <span className="text-sm font-bold tabular-nums">{fmtSize(c.mb)}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toast.success(`${c.label} 정리를 예약했습니다`, { description: "데모 전용: 실제 작업은 실행되지 않습니다." })}
                >
                  정리
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
