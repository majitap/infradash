"use client"

import * as React from "react"
import { toast } from "sonner"
import { ArchiveIcon, BrushCleaningIcon, CheckIcon, DatabaseIcon, HardDriveIcon, TrendingUpIcon } from "lucide-react"

import { TimeBarChart } from "@/components/charts/time-bar-chart"
import { DonutChart } from "@/components/dashboard/donut-chart"
import { KpiGrid, KpiTile } from "@/components/dashboard/kpi-tile"
import { Section } from "@/components/dashboard/section-header"
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
import { cn } from "@/lib/utils"

/** one color per storage kind, shared by every chart on the page */
const KIND_COLOR: Record<StorageKind, string> = {
  repository: "var(--chart-1)",
  artifacts: "var(--chart-2)",
  registry: "var(--chart-3)",
  lfs: "var(--chart-4)",
  packages: "var(--chart-5)",
  wiki: "var(--chart-6)",
  uploads: "var(--chart-7)",
}

const SERIES = STORAGE_KINDS.map((k) => ({ key: k.key, label: k.label, color: KIND_COLOR[k.key] }))

function StackedBar({ row, max }: { row: (typeof topStorageProjects)[number]; max: number }) {
  return (
    <div className="flex h-2.5 gap-[2px] overflow-hidden rounded-full bg-black/[0.045] dark:bg-white/[0.06]" style={{ width: `${(row.total / max) * 100}%` }}>
      {STORAGE_KINDS.map((k) => {
        const v = row[k.key as keyof typeof row] as number
        if (!v) return null
        return (
          <div
            key={k.key}
            title={`${k.label} ${fmtSize(v)}`}
            className="first:rounded-l-full last:rounded-r-full"
            style={{ width: `${(v / row.total) * 100}%`, background: KIND_COLOR[k.key] }}
          />
        )
      })}
    </div>
  )
}

export function StorageView() {
  const [scheduled, setScheduled] = React.useState<Record<string, boolean>>({})
  const usedPct = (storageTotalMb / storageQuotaMb) * 100
  const freeMb = Math.max(0, storageQuotaMb - storageTotalMb)
  const maxProject = Math.max(...topStorageProjects.map((p) => p.total))
  const scheduledMb = cleanupCandidates.filter((c) => scheduled[c.label]).reduce((s, c) => s + c.mb, 0)

  return (
    <>
      {/* macOS System Settings -> General -> Storage Bar Hero */}
      <Section>
        <Card className="py-5">
          <CardContent className="flex flex-col gap-3.5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="flex size-8 items-center justify-center rounded-[10px] bg-tone-amber/12 text-tone-amber">
                  <HardDriveIcon className="size-4 stroke-[2.2]" />
                </span>
                <div>
                  <div className="text-[15px] font-bold tracking-[-0.02em] text-foreground">GitLab 클러스터 볼륨 점유율</div>
                  <div className="text-xs text-muted-foreground">macOS 스타일 유형별 실시간 스토리지 맵</div>
                </div>
              </div>
              <div className="text-sm tabular-nums">
                <b className="text-base font-bold tracking-[-0.02em] text-foreground">{fmtSize(storageTotalMb)}</b>
                <span className="text-muted-foreground"> / {fmtSize(storageQuotaMb)} 사용 중 · 여유 {fmtSize(freeMb)}</span>
              </div>
            </div>

            <div className="flex h-4.5 gap-[2px] overflow-hidden rounded-full bg-black/[0.055] p-[2px] dark:bg-white/[0.08]">
              {storageByKind.map((k) => (
                <div
                  key={k.key}
                  title={`${k.label}: ${fmtSize(k.mb)}`}
                  className="h-full rounded-[3px] first:rounded-l-full transition-opacity hover:opacity-85"
                  style={{ width: `${(k.mb / storageQuotaMb) * 100}%`, background: KIND_COLOR[k.key] }}
                />
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs">
              {storageByKind.map((k) => (
                <span key={k.key} className="inline-flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full" style={{ background: KIND_COLOR[k.key] }} />
                  <span className="text-muted-foreground">{k.label}</span>
                  <span className="font-semibold text-foreground tabular-nums">{fmtSize(k.mb)}</span>
                </span>
              ))}
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-black/[0.1] dark:bg-white/[0.15]" />
                <span className="text-muted-foreground">여유 공간</span>
                <span className="font-semibold text-foreground tabular-nums">{fmtSize(freeMb)}</span>
              </span>
            </div>
          </CardContent>
        </Card>
      </Section>

      <KpiGrid>
        <KpiTile
          label="총 사용량"
          value={fmtSize(storageTotalMb)}
          hint={`전체 쿼터의 ${fmtPct(usedPct, 0)}`}
          icon={HardDriveIcon}
          tone={usedPct > 80 ? "amber" : "indigo"}
          spark={monthlyStorage.map((m) => STORAGE_KINDS.reduce((s, k) => s + m[k.key], 0))}
        />
        <KpiTile
          label="최근 30일 증가"
          value={fmtSize(storageGrowth30dMb)}
          hint="아티팩트 및 컨테이너 이미지 중심"
          icon={TrendingUpIcon}
          tone="orange"
        />
        <KpiTile
          label="정리 가능 용량"
          value={fmtSize(cleanupTotalMb)}
          hint={scheduledMb > 0 ? `${fmtSize(scheduledMb)} 정리 예약됨` : `${cleanupCandidates.length}개 자동 보존 정책 후보`}
          icon={BrushCleaningIcon}
          tone="emerald"
        />
        <KpiTile
          label="최대 점유 유형"
          value={storageByKind.reduce((a, b) => (b.mb > a.mb ? b : a)).label}
          hint={fmtSize(Math.max(...storageByKind.map((k) => k.mb)))}
          icon={DatabaseIcon}
          tone="sky"
        />
      </KpiGrid>

      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @5xl/main:grid-cols-12">
        <Card className="@5xl/main:col-span-4">
          <CardHeader>
            <CardTitle>유형별 비중</CardTitle>
            <CardDescription>전체 저장소 합산 구성비</CardDescription>
          </CardHeader>
          <CardContent>
            <DonutChart
              data={storageByKind.map((k) => ({ key: k.key, label: k.label, value: k.mb, color: KIND_COLOR[k.key] }))}
              centerValue={fmtSize(storageTotalMb)}
              centerLabel="사용 중"
              legend="bottom"
              formatValue={fmtSize}
            />
          </CardContent>
        </Card>

        <Card className="@5xl/main:col-span-8">
          <CardHeader>
            <CardTitle>월별 스토리지 누적 추이</CardTitle>
            <CardDescription>유형별 누적 사용량 (GB) · 최근 12개월</CardDescription>
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

      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @5xl/main:grid-cols-12">
        <Card className="@5xl/main:col-span-8">
          <CardHeader>
            <CardTitle>상위 스토리지 소비 프로젝트</CardTitle>
            <CardDescription>상위 10개 저장소 · 유형별 누적 막대</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-3">
              {topStorageProjects.map((p) => (
                <li key={p.project} className="grid grid-cols-[minmax(0,12rem)_1fr_auto] items-center gap-3">
                  <div className="min-w-0 leading-tight">
                    <div className="flex items-center gap-1.5 font-mono text-[13px] font-semibold text-foreground">
                      <span className="truncate">{p.project}</span>
                      {p.archived && <ArchiveIcon className="size-3 shrink-0 text-muted-foreground" />}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">{p.group}</div>
                  </div>
                  <StackedBar row={p} max={maxProject} />
                  <span className="w-16 text-right text-sm font-bold text-foreground tabular-nums">{fmtSize(p.total)}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="@5xl/main:col-span-4">
          <CardHeader>
            <CardTitle>스마트 용량 최적화</CardTitle>
            <CardDescription>권장 정책 적용 시 {fmtSize(cleanupTotalMb)} 확보 가능</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2.5">
            {cleanupCandidates.map((c) => {
              const isDone = scheduled[c.label]
              return (
                <div
                  key={c.label}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl bg-black/[0.022] px-3.5 py-3 ring-1 ring-black/[0.045] transition-colors dark:bg-white/[0.03] dark:ring-white/[0.055]",
                    isDone && "opacity-75"
                  )}
                >
                  <span className="size-2.5 shrink-0 rounded-full" style={{ background: KIND_COLOR[c.kind] }} />
                  <div className="min-w-0 flex-1 leading-snug">
                    <div className="truncate text-[13.5px] font-semibold text-foreground">{c.label}</div>
                    <div className="truncate text-xs text-muted-foreground">{c.action}</div>
                  </div>
                  <span className="text-[13px] font-bold text-foreground tabular-nums">{fmtSize(c.mb)}</span>
                  <Button
                    size="sm"
                    variant={isDone ? "secondary" : "outline"}
                    className="rounded-full"
                    onClick={() => {
                      setScheduled((s) => ({ ...s, [c.label]: !isDone }))
                      toast.success(isDone ? `${c.label} 정리 예약을 취소했습니다` : `${c.label} 정리를 예약했습니다`, {
                        description: "데모 전용: 실제 볼륨에는 변경이 발생하지 않습니다.",
                      })
                    }}
                  >
                    {isDone ? (
                      <>
                        <CheckIcon className="size-3.5 text-tone-emerald" />
                        예약됨
                      </>
                    ) : (
                      "정리"
                    )}
                  </Button>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
