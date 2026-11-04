"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  ActivityIcon,
  CircleCheckIcon,
  CirclePauseIcon,
  CircleXIcon,
  CpuIcon,
  PlayIcon,
  RotateCwIcon,
  SearchIcon,
  ServerIcon,
  TriangleAlertIcon,
  type LucideIcon,
} from "lucide-react"

import { BarList } from "@/components/dashboard/bar-list"
import { DonutChart } from "@/components/dashboard/donut-chart"
import { KpiGrid, KpiTile } from "@/components/dashboard/kpi-tile"
import { Sparkline } from "@/components/dashboard/sparkline"
import { StatusPill } from "@/components/dashboard/status-pill"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fmtInt, fmtPct, relativeTime } from "@/lib/format"
import { LATEST_RUNNER_VERSION, outdatedRunners, runnerBusy, runnerCapacity, runnerCounts, runners, type MockRunner, type RunnerStatus } from "@/lib/mock-data"
import type { Status } from "@/lib/tones"
import { cn } from "@/lib/utils"

const STATUS_META: Record<RunnerStatus, { status: Status; label: string; icon: LucideIcon }> = {
  online: { status: "good", label: "온라인", icon: CircleCheckIcon },
  offline: { status: "critical", label: "오프라인", icon: CircleXIcon },
  paused: { status: "warning", label: "일시중지", icon: CirclePauseIcon },
}

type Filter = "all" | RunnerStatus

function Meter({ value, label }: { value: number; label: string }) {
  const tone = value >= 85 ? "bg-status-critical" : value >= 65 ? "bg-status-warning" : "bg-tone-teal"
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-8 font-medium text-muted-foreground">{label}</span>
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-black/[0.06] dark:bg-white/[0.08]">
        <div className={cn("h-full rounded-full transition-all", tone)} style={{ width: `${value}%` }} />
      </div>
      <span className="w-8 text-right font-medium tabular-nums">{value}%</span>
    </div>
  )
}

export function RunnersView() {
  const [filter, setFilter] = React.useState<Filter>("all")
  const [query, setQuery] = React.useState("")
  const [target, setTarget] = React.useState<MockRunner | null>(null)
  const [paused, setPaused] = React.useState<Record<number, boolean>>(() =>
    Object.fromEntries(runners.map((r) => [r.id, r.status === "paused"]))
  )

  const q = query.trim().toLowerCase()
  const rows = runners
    .filter((r) => filter === "all" || r.status === filter)
    .filter((r) => !q || `${r.name} ${r.description} ${r.executor} ${r.ipAddress} ${r.tags.join(" ")}`.toLowerCase().includes(q))

  const jobs24h = runners.reduce((s, r) => s + r.jobsLast24h, 0)
  const byExecutor = ["docker", "kubernetes", "shell", "docker-autoscaler"].map((e) => ({
    executor: e,
    jobs: runners.filter((r) => r.executor === e).reduce((s, r) => s + r.jobsLast24h, 0),
    count: runners.filter((r) => r.executor === e).length,
  }))

  function confirmRestart() {
    if (!target) return
    toast.success(`${target.name} 재시작을 요청했습니다`, {
      description: "데모 전용: 실제 요청은 전송되지 않았습니다.",
    })
    setTarget(null)
  }

  function togglePause(r: MockRunner) {
    const next = !paused[r.id]
    setPaused((p) => ({ ...p, [r.id]: next }))
    toast(next ? `${r.name}을(를) 일시중지했습니다` : `${r.name}을(를) 재개했습니다`, {
      description: "데모 전용: 화면 상태만 바뀌며 실제 러너에는 영향이 없습니다.",
    })
  }

  return (
    <>
      <KpiGrid>
        <KpiTile
          label="온라인 러너"
          value={`${runnerCounts.online} / ${runnerCounts.all}`}
          hint={`오프라인 ${runnerCounts.offline} · 일시중지 ${runnerCounts.paused}`}
          icon={ServerIcon}
          tone={runnerCounts.offline > 0 ? "amber" : "teal"}
        />
        <KpiTile
          label="동시 실행 슬롯"
          value={`${runnerBusy} / ${runnerCapacity}`}
          hint={`점유율 ${fmtPct((runnerBusy / runnerCapacity) * 100, 0)} · 온라인 기준`}
          icon={ActivityIcon}
          tone="teal"
        />
        <KpiTile
          label="24시간 처리 잡"
          value={fmtInt(jobs24h)}
          unit="개"
          hint="클러스터 전체 합계"
          icon={PlayIcon}
          tone="sky"
          spark={Array.from({ length: 7 }, (_, i) => runners.reduce((s, r) => s + r.jobsLast7d[i], 0))}
        />
        <KpiTile
          label="구버전 러너"
          value={fmtInt(outdatedRunners.length)}
          unit="대"
          hint={`최신 권장 ${LATEST_RUNNER_VERSION}`}
          icon={TriangleAlertIcon}
          tone={outdatedRunners.length > 0 ? "amber" : "emerald"}
        />
      </KpiGrid>

      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @3xl/main:grid-cols-2 @6xl/main:grid-cols-12">
        <Card className="@6xl/main:col-span-4">
          <CardHeader>
            <CardTitle>러너 가용 상태</CardTitle>
            <CardDescription>등록된 전체 노드 {runnerCounts.all}대</CardDescription>
          </CardHeader>
          <CardContent>
            <DonutChart
              data={[
                { key: "online", label: "온라인", value: runnerCounts.online, color: "var(--status-good)" },
                { key: "paused", label: "일시중지", value: runnerCounts.paused, color: "var(--status-warning)" },
                { key: "offline", label: "오프라인", value: runnerCounts.offline, color: "var(--status-critical)" },
              ]}
              centerValue={String(runnerCounts.online)}
              centerLabel="온라인"
            />
          </CardContent>
        </Card>

        <Card className="@6xl/main:col-span-4">
          <CardHeader>
            <CardTitle>실행기(Executor) 처리량</CardTitle>
            <CardDescription>최근 24시간 실행 잡 분포</CardDescription>
          </CardHeader>
          <CardContent>
            <BarList
              color="var(--chart-1)"
              items={byExecutor.map((e) => ({
                key: e.executor,
                label: <span className="font-mono text-[12.5px]">{e.executor}</span>,
                value: e.jobs,
                secondary: `${e.count}대`,
              }))}
            />
          </CardContent>
        </Card>

        <Card className="@3xl/main:col-span-2 @6xl/main:col-span-4">
          <CardHeader>
            <CardTitle>점검 필요 노드</CardTitle>
            <CardDescription>오프라인 상태이거나 운영 메모가 등록된 러너</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {runners
              .filter((r) => r.status !== "online" || r.note)
              .map((r) => {
                const m = STATUS_META[r.status]
                return (
                  <div
                    key={r.id}
                    className="flex items-center gap-3 rounded-2xl bg-black/[0.024] px-3.5 py-2.5 ring-1 ring-black/[0.045] dark:bg-white/[0.03] dark:ring-white/[0.055]"
                  >
                    <div className="min-w-0 flex-1 leading-snug">
                      <div className="truncate font-mono text-[13px] font-semibold text-foreground">{r.name}</div>
                      <div className="truncate text-xs text-muted-foreground">{r.note ?? `마지막 접속 ${relativeTime(r.lastContact)}`}</div>
                    </div>
                    <StatusPill status={m.status} label={m.label} icon={m.icon} size="xs" />
                  </div>
                )
              })}
          </CardContent>
        </Card>
      </div>

      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle>러너 플릿 관리</CardTitle>
            <CardDescription>노드별 리소스 점유율 및 원격 제어 · 데모 액션은 확인 후 토스트로만 시뮬레이션됩니다</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
                <TabsList className="h-auto flex-wrap">
                  {(["all", "online", "offline", "paused"] as const).map((key) => (
                    <TabsTrigger key={key} value={key}>
                      {key === "all" ? "전체" : STATUS_META[key].label}
                      <Badge variant="secondary" className="px-1.5 tabular-nums">
                        {runnerCounts[key]}
                      </Badge>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              <div className="relative sm:w-72">
                <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="러너 이름, IP, 태그, 실행기 검색"
                  className="pl-9"
                  aria-label="러너 검색"
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-black/[0.055] dark:border-white/[0.065]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-56">러너 노드</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead className="hidden lg:table-cell">실행기 · OS</TableHead>
                    <TableHead className="hidden xl:table-cell">태그</TableHead>
                    <TableHead>버전</TableHead>
                    <TableHead className="hidden md:table-cell">리소스 부하</TableHead>
                    <TableHead className="hidden text-right md:table-cell">슬롯</TableHead>
                    <TableHead className="hidden 2xl:table-cell">7일 추이</TableHead>
                    <TableHead className="hidden text-right lg:table-cell">최근 통신</TableHead>
                    <TableHead className="text-right">제어</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => {
                    const m = STATUS_META[r.status]
                    const outdated = r.version !== LATEST_RUNNER_VERSION
                    const isPaused = paused[r.id]
                    return (
                      <TableRow key={r.id}>
                        <TableCell>
                          <div className="font-mono text-[13px] font-semibold text-foreground">{r.name}</div>
                          <div className="text-xs text-muted-foreground">
                            #{r.id} · {r.ipAddress} · {r.description}
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusPill status={m.status} label={m.label} icon={m.icon} size="xs" />
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="font-mono text-xs font-medium">{r.executor}</div>
                          <div className="text-xs text-muted-foreground">
                            {r.os} · {r.arch}
                          </div>
                        </TableCell>
                        <TableCell className="hidden xl:table-cell">
                          <div className="flex max-w-48 flex-wrap gap-1">
                            {r.tags.map((t) => (
                              <span key={t} className="rounded-md bg-black/[0.045] px-1.5 py-0.5 font-mono text-[11px] font-medium dark:bg-white/[0.07]">
                                {t}
                              </span>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "font-mono text-xs tabular-nums",
                              outdated && "rounded-full bg-tone-amber/14 px-2 py-0.5 font-semibold text-tone-amber"
                            )}
                          >
                            {r.version}
                          </span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {r.status === "online" ? (
                            <div className="flex flex-col gap-1">
                              <Meter value={r.cpuLoad} label="CPU" />
                              <Meter value={r.memUsed} label="MEM" />
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden text-right tabular-nums md:table-cell">
                          <div className="font-semibold text-foreground">
                            {r.jobsRunning} / {r.concurrent}
                          </div>
                          <div className="text-xs text-muted-foreground">24h {fmtInt(r.jobsLast24h)}</div>
                        </TableCell>
                        <TableCell className="hidden 2xl:table-cell">
                          <Sparkline data={r.jobsLast7d} color="var(--tone-teal)" className="h-6 w-20" />
                        </TableCell>
                        <TableCell className="hidden text-right text-xs text-muted-foreground whitespace-nowrap lg:table-cell">
                          {relativeTime(r.lastContact)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1.5">
                            <Button variant="outline" size="sm" className="rounded-full" onClick={() => togglePause(r)} disabled={r.status === "offline"}>
                              {isPaused ? <PlayIcon /> : <CirclePauseIcon />}
                              <span className="hidden sm:inline">{isPaused ? "재개" : "일시중지"}</span>
                            </Button>
                            <Button variant="outline" size="sm" className="rounded-full" onClick={() => setTarget(r)}>
                              <RotateCwIcon />
                              <span className="hidden sm:inline">재시작</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={target !== null} onOpenChange={(open) => !open && setTarget(null)}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>{target?.name} 러너를 재시작할까요?</AlertDialogTitle>
            <AlertDialogDescription>
              {target && target.jobsRunning > 0 ? `실행 중인 잡 ${target.jobsRunning}개가 중단됩니다. ` : ""}
              데모이므로 실제로 재시작되지는 않습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">취소</AlertDialogCancel>
            <AlertDialogAction className="rounded-full" onClick={confirmRestart}>
              <CpuIcon />
              재시작
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
