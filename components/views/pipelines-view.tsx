"use client"

import * as React from "react"
import {
  CircleCheckIcon,
  CircleXIcon,
  ClockIcon,
  GitBranchIcon,
  HourglassIcon,
  LoaderCircleIcon,
  PlayIcon,
  SparklesIcon,
  TimerIcon,
  WorkflowIcon,
  type LucideIcon,
} from "lucide-react"

import { PipelineAreaChart, usePipelineRange } from "@/components/charts/pipeline-area-chart"
import { TimeLineChart } from "@/components/charts/time-line-chart"
import { BarList } from "@/components/dashboard/bar-list"
import { KpiGrid, KpiTile } from "@/components/dashboard/kpi-tile"
import { ProjectRef } from "@/components/dashboard/project-ref"
import { StatusPill } from "@/components/dashboard/status-pill"
import { trendOf } from "@/components/dashboard/trend-badge"
import { UserCell } from "@/components/dashboard/user-avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fmtDateShort, fmtInt, fmtMinutes, fmtPct, fmtSeconds, fmtWeekRange, relativeTime } from "@/lib/format"
import {
  avgQueueSeconds,
  dailyPipelines,
  durationTrend,
  pipelines7d,
  pipelinesToday,
  projectPipelineStats,
  recentPipelines,
  runningCount,
  slowestJobs,
  stageFailures,
  successRate7d,
  successRatePrev7d,
  type RecentPipeline,
} from "@/lib/mock-data"
import type { Status } from "@/lib/tones"
import { cn } from "@/lib/utils"

const STATUS_META: Record<RecentPipeline["status"], { status: Status; label: string; icon: LucideIcon }> = {
  success: { status: "good", label: "성공", icon: CircleCheckIcon },
  failed: { status: "critical", label: "실패", icon: CircleXIcon },
  running: { status: "info", label: "실행 중", icon: LoaderCircleIcon },
  canceled: { status: "neutral", label: "취소", icon: CircleXIcon },
  pending: { status: "neutral", label: "대기", icon: HourglassIcon },
}

const SOURCE_LABEL: Record<RecentPipeline["source"], string> = {
  push: "push",
  merge_request: "MR",
  schedule: "스케줄",
  web: "수동",
  api: "API",
}

function rateStatus(rate: number): { status: Status; icon: LucideIcon } {
  if (rate >= 95) return { status: "good", icon: CircleCheckIcon }
  if (rate >= 88) return { status: "warning", icon: CircleXIcon }
  return { status: "critical", icon: CircleXIcon }
}

type PipeFilter = "all" | "success" | "failed" | "active"

export function PipelinesView() {
  const { range, control } = usePipelineRange()
  const [pipeFilter, setPipeFilter] = React.useState<PipeFilter>("all")

  const today = pipelinesToday.success + pipelinesToday.failed + pipelinesToday.canceled
  const totalFailures = stageFailures.reduce((s, f) => s + f.failures, 0)

  const filteredRecent = recentPipelines.filter((p) => {
    if (pipeFilter === "all") return true
    if (pipeFilter === "active") return p.status === "running" || p.status === "pending"
    return p.status === pipeFilter
  })

  return (
    <>
      <KpiGrid>
        <KpiTile
          label="7일 성공률"
          value={fmtPct(successRate7d, 1)}
          hint={`이전 7일 ${fmtPct(successRatePrev7d, 1)}`}
          trend={trendOf(successRate7d, successRatePrev7d, { digits: 1, suffix: "pt" })}
          icon={WorkflowIcon}
          tone="sky"
          spark={dailyPipelines.slice(-14).map((d) => (d.success / (d.success + d.failed)) * 100)}
        />
        <KpiTile
          label="오늘 실행"
          value={fmtInt(today)}
          unit="회"
          hint={`실행 중 ${runningCount} · 실패 ${pipelinesToday.failed} · 7일 ${fmtInt(pipelines7d)}회`}
          icon={PlayIcon}
          tone="indigo"
          spark={dailyPipelines.slice(-14).map((d) => d.success + d.failed + d.canceled)}
        />
        <KpiTile
          label="소요 시간 (중앙값)"
          value={durationTrend[11].p50.toFixed(1)}
          unit="분"
          hint={`p90 ${durationTrend[11].p90.toFixed(1)}분`}
          trend={trendOf(durationTrend[11].p50, durationTrend[10].p50, { invert: true, digits: 1, suffix: "분" })}
          icon={TimerIcon}
          tone="violet"
          spark={durationTrend.map((d) => d.p50)}
        />
        <KpiTile
          label="평균 큐 대기 시간"
          value={fmtSeconds(avgQueueSeconds)}
          hint="잡 생성 → 러너 슬롯 할당"
          icon={ClockIcon}
          tone="teal"
        />
      </KpiGrid>

      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @5xl/main:grid-cols-12">
        <Card className="@5xl/main:col-span-8">
          <CardHeader>
            <CardTitle>일별 파이프라인 실행 추이</CardTitle>
            <CardDescription>성공 / 실패 건수 · 2주 전 배포 장애일에 실패 급증 기록</CardDescription>
            <CardAction>{control}</CardAction>
          </CardHeader>
          <CardContent>
            <PipelineAreaChart days={dailyPipelines.slice(-range)} />
          </CardContent>
        </Card>

        <Card className="@5xl/main:col-span-4">
          <CardHeader>
            <CardTitle>실패 스테이지 분포</CardTitle>
            <CardDescription>최근 30일 · 총 {fmtInt(totalFailures)}건 실패</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col justify-between gap-4">
            <BarList
              color="var(--status-critical)"
              items={stageFailures.map((s) => ({
                key: s.stage,
                label: <span className="font-mono text-[12.5px]">{s.label}</span>,
                value: s.failures,
                secondary: fmtPct((s.failures / totalFailures) * 100, 0),
              }))}
            />
            <div className="apple-inset-well flex items-start gap-2.5 rounded-2xl p-3 text-xs leading-relaxed text-muted-foreground">
              <SparklesIcon className="mt-0.5 size-3.5 shrink-0 text-tone-rose" />
              <span>
                <b className="font-semibold text-foreground">test 스테이지</b> 실패의 대부분은 <code className="font-mono">web-console</code> e2e와{" "}
                <code className="font-mono">order-service</code> 통합 테스트에서 집중 발생합니다.
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @5xl/main:grid-cols-12">
        <Card className="@5xl/main:col-span-5">
          <CardHeader>
            <CardTitle>소요 시간 퍼센타일 추이</CardTitle>
            <CardDescription>주별 중앙값(p50)과 상위 10%(p90) 빌드 시간</CardDescription>
          </CardHeader>
          <CardContent>
            <TimeLineChart
              data={durationTrend.map((d) => ({ week: d.weekStart, p50: d.p50, p90: d.p90 }))}
              xKey="week"
              series={[
                { key: "p50", label: "중앙값 (p50)", color: "var(--chart-1)" },
                { key: "p90", label: "상위 10% (p90)", color: "var(--chart-2)" },
              ]}
              xFormatter={fmtDateShort}
              labelFormatter={fmtWeekRange}
              valueFormatter={(v) => `${v.toFixed(0)}분`}
            />
          </CardContent>
        </Card>

        <Card className="@5xl/main:col-span-7">
          <CardHeader>
            <CardTitle>프로젝트별 빌드 신뢰도</CardTitle>
            <CardDescription>최근 30일 · 실행 횟수 상위 10개 저장소</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-2xl border border-black/[0.055] dark:border-white/[0.065]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>프로젝트</TableHead>
                    <TableHead className="text-right">30일 실행</TableHead>
                    <TableHead className="w-56">성공률</TableHead>
                    <TableHead className="hidden text-right md:table-cell">평균 소요</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projectPipelineStats.slice(0, 10).map((p) => {
                    const rs = rateStatus(p.successRate)
                    return (
                      <TableRow key={p.project}>
                        <TableCell>
                          <ProjectRef name={p.project} />
                        </TableCell>
                        <TableCell className="text-right font-medium tabular-nums">{fmtInt(p.total30d)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/[0.05] dark:bg-white/[0.07]">
                              <div
                                className={cn(
                                  "h-full rounded-full",
                                  rs.status === "good" ? "bg-status-good" : rs.status === "warning" ? "bg-status-warning" : "bg-status-critical"
                                )}
                                style={{ width: `${p.successRate}%` }}
                              />
                            </div>
                            <StatusPill status={rs.status} label={fmtPct(p.successRate, 1)} icon={rs.icon} size="xs" className="w-20 justify-center" />
                          </div>
                        </TableCell>
                        <TableCell className="hidden text-right text-muted-foreground tabular-nums md:table-cell">{fmtMinutes(p.avgMinutes)}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @5xl/main:grid-cols-12">
        <Card className="@5xl/main:col-span-8">
          <CardHeader>
            <CardTitle>최근 파이프라인 실행 내역</CardTitle>
            <CardDescription>전체 저장소 실시간 실행 스트림</CardDescription>
            <CardAction>
              <Tabs value={pipeFilter} onValueChange={(v) => setPipeFilter(v as PipeFilter)}>
                <TabsList>
                  <TabsTrigger value="all">
                    전체
                    <Badge variant="secondary" className="px-1.5 tabular-nums">{recentPipelines.length}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="failed">실패</TabsTrigger>
                  <TabsTrigger value="active">실행 중</TabsTrigger>
                  <TabsTrigger value="success">성공</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-2xl border border-black/[0.055] dark:border-white/[0.065]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>파이프라인</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead className="hidden md:table-cell">트리거</TableHead>
                    <TableHead className="hidden text-right lg:table-cell">소요</TableHead>
                    <TableHead className="text-right">시작</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecent.map((p) => {
                    const meta = STATUS_META[p.status]
                    return (
                      <TableRow key={p.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-muted-foreground">#{p.id}</span>
                            <ProjectRef name={p.project} showGroup={false} />
                          </div>
                          <div className="mt-0.5 inline-flex items-center gap-1 font-mono text-xs text-muted-foreground">
                            <GitBranchIcon className="size-3" />
                            {p.ref}
                            {p.failedStage && (
                              <span className="ml-1 rounded-full bg-tone-rose/12 px-1.5 py-px text-[10.5px] font-semibold text-tone-rose">
                                {p.failedStage}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusPill status={meta.status} label={meta.label} icon={meta.icon} size="xs" />
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-2">
                            <UserCell name={p.triggeredBy.name} hue={p.triggeredBy.hue} size="xs" />
                            <span className="rounded-md bg-black/[0.045] px-1.5 py-0.5 text-[11px] font-semibold text-muted-foreground dark:bg-white/[0.07]">
                              {SOURCE_LABEL[p.source]}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden text-right tabular-nums lg:table-cell">
                          {p.status === "running" ? (
                            <span className="font-semibold text-tone-sky">{fmtSeconds(p.durationSeconds)} 경과</span>
                          ) : (
                            fmtSeconds(p.durationSeconds)
                          )}
                        </TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground whitespace-nowrap">{relativeTime(p.startedAt)}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="@5xl/main:col-span-4">
          <CardHeader>
            <CardTitle>병목 잡 (Slowest Jobs)</CardTitle>
            <CardDescription>7일 평균 소요 시간 · 전주 대비 증감</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col divide-y divide-black/[0.045] dark:divide-white/[0.055]">
              {slowestJobs.map((j) => (
                <li key={`${j.project}-${j.job}`} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                  <div className="min-w-0 flex-1 leading-snug">
                    <div className="truncate font-mono text-[13px] font-semibold text-foreground">{j.job}</div>
                    <div className="truncate text-[11.5px] text-muted-foreground">
                      {j.project} · {j.stage} · {j.runs7d}회
                    </div>
                  </div>
                  <div className="text-right leading-tight">
                    <div className="font-bold text-foreground tabular-nums">{j.avgMinutes.toFixed(1)}분</div>
                    <div
                      className={cn(
                        "text-[11.5px] font-medium tabular-nums",
                        j.delta > 0 ? "text-tone-rose" : j.delta < 0 ? "text-tone-emerald" : "text-muted-foreground"
                      )}
                    >
                      {j.delta > 0 ? "+" : ""}
                      {j.delta.toFixed(1)}분
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
