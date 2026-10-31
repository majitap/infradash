"use client"

import Link from "next/link"
import {
  ArrowRightIcon,
  ChevronRightIcon,
  CircleArrowUpIcon,
  CircleCheckIcon,
  CirclePauseIcon,
  CircleXIcon,
  GitCommitHorizontalIcon,
  GitPullRequestIcon,
  HardDriveIcon,
  ServerIcon,
  ShieldAlertIcon,
  SirenIcon,
  TimerIcon,
  UsersIcon,
  WorkflowIcon,
  type LucideIcon,
} from "lucide-react"

import { PipelineAreaChart, usePipelineRange } from "@/components/charts/pipeline-area-chart"
import { ActivityFeed } from "@/components/dashboard/activity-feed"
import { ContributionHeatmap } from "@/components/dashboard/contribution-heatmap"
import { DonutChart } from "@/components/dashboard/donut-chart"
import { KpiGrid, KpiTile } from "@/components/dashboard/kpi-tile"
import { Leaderboard } from "@/components/dashboard/leaderboard"
import { Section } from "@/components/dashboard/section-header"
import { StatusPill } from "@/components/dashboard/status-pill"
import { trendOf } from "@/components/dashboard/trend-badge"
import { UserAvatar } from "@/components/dashboard/user-avatar"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { fmtDate, fmtInt, fmtMinutes, fmtPct, fmtSize } from "@/lib/format"
import {
  MONTHS_12,
  activeUsers,
  activityFeed,
  approvedMRs,
  busiestDay,
  commits30d,
  commitsLastWeek,
  commitsThisWeek,
  dailyCommits,
  dailyPipelines,
  joiners,
  leavers,
  leaderboard,
  mergedLastWeek,
  mergedThisWeek,
  openIncidents,
  openMRs,
  pipelines7d,
  runnerBusy,
  runnerCapacity,
  runnerCounts,
  runners,
  severityTotals,
  staleMRs,
  storageQuotaMb,
  storageTotalMb,
  successRate7d,
  successRatePrev7d,
  upgradePlan,
  users,
  weeklyTeamCommits,
  weeklyThroughput,
} from "@/lib/mock-data"
import { STATUS, type Status } from "@/lib/tones"
import { cn } from "@/lib/utils"

/** active accounts at the end of each of the last 12 months */
const monthlyActiveUsers = MONTHS_12.map((m) =>
  users.filter((u) => u.status !== "pending" && u.joinedAt <= `${m}-31` && (!u.leftAt || u.leftAt > `${m}-31`)).length
)
const dailySuccessRate = dailyPipelines.slice(-14).map((d) => (d.success / (d.success + d.failed)) * 100)

type Attention = { label: string; detail: string; status: Status; href: string; icon: LucideIcon }

function IncidentBanner() {
  const s1 = openIncidents.find((i) => i.severity === "S1")
  if (!s1) return null
  return (
    <Section>
      <Link
        href="/incidents"
        className="group flex items-center gap-3 rounded-xl border border-rose-500/30 bg-rose-500/8 px-4 py-3 text-sm transition-colors hover:bg-rose-500/12 dark:bg-rose-500/10"
      >
        <span className="relative flex size-9 shrink-0 items-center justify-center rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-300">
          <SirenIcon className="size-5" />
          <span className="absolute -top-0.5 -right-0.5 size-2.5 animate-ping rounded-full bg-rose-500 opacity-70" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="font-extrabold text-rose-700 dark:text-rose-300">S1 인시던트 진행 중</span>
            <span className="truncate font-bold">
              {s1.id} · {s1.title}
            </span>
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <TimerIcon className="size-3.5" />
              {fmtMinutes(s1.durationMin)} 경과
            </span>
            <span>{s1.impact}</span>
            <span className="inline-flex items-center gap-1">
              담당 <UserAvatar name={s1.owner.name} hue={s1.owner.hue} size="xs" className="size-4 text-[9px]" /> {s1.owner.name}
            </span>
          </div>
        </div>
        <ChevronRightIcon className="size-5 shrink-0 text-rose-600/70 transition-transform group-hover:translate-x-0.5 dark:text-rose-300/70" />
      </Link>
    </Section>
  )
}

export function OverviewView() {
  const { range, control } = usePipelineRange()
  const top5 = leaderboard("thisWeek", 5)
  const needsReview = openMRs.filter((m) => m.state === "open" && m.approvals < m.approvalsRequired).length
  const critical = severityTotals.find((s) => s.severity === "critical")?.count ?? 0
  const offlineRunners = runners.filter((r) => r.status === "offline")
  const storagePct = (storageTotalMb / storageQuotaMb) * 100

  const attention: Attention[] = [
    ...(openIncidents.length
      ? [{ label: `인시던트 ${openIncidents.length}건 진행 중`, detail: openIncidents.map((i) => i.id).join(", "), status: "critical" as Status, href: "/incidents", icon: SirenIcon }]
      : []),
    { label: `치명 취약점 ${critical}건`, detail: "시크릿 노출 1 · SQL 인젝션 1", status: critical > 0 ? "critical" : "good", href: "/security", icon: ShieldAlertIcon },
    { label: `러너 ${offlineRunners.length}대 오프라인`, detail: offlineRunners.map((r) => r.name).join(", "), status: offlineRunners.length ? "warning" : "good", href: "/runners", icon: ServerIcon },
    { label: `10일 이상 열린 MR ${staleMRs.length}건`, detail: `가장 오래된 !${staleMRs[0]?.iid}`, status: staleMRs.length > 3 ? "warning" : "neutral", href: "/merge-requests", icon: GitPullRequestIcon },
    { label: `스토리지 ${storagePct.toFixed(0)}% 사용`, detail: `${fmtSize(storageTotalMb)} / ${fmtSize(storageQuotaMb)}`, status: storagePct > 80 ? "warning" : "good", href: "/storage", icon: HardDriveIcon },
    { label: "업그레이드 D-15", detail: `${upgradePlan.currentVersion} → ${upgradePlan.targetVersion} · 11월 15일`, status: "info", href: "/upgrade", icon: CircleArrowUpIcon },
  ]

  return (
    <>
      <IncidentBanner />

      <KpiGrid>
        <KpiTile
          label="활성 사용자"
          value={fmtInt(activeUsers.length)}
          unit="명"
          hint={`30일 입사 ${joiners.length} · 퇴사 ${leavers.length}`}
          trend={trendOf(joiners.length, leavers.length, { suffix: "명" })}
          icon={UsersIcon}
          tone="indigo"
          spark={monthlyActiveUsers}
          href="/users"
        />
        <KpiTile
          label="이번 주 커밋"
          value={fmtInt(commitsThisWeek)}
          unit="개"
          hint={`지난주 ${fmtInt(commitsLastWeek)}개 · 토요일 오전 기준`}
          trend={trendOf(commitsThisWeek, commitsLastWeek, { pct: true })}
          icon={GitCommitHorizontalIcon}
          tone="violet"
          spark={weeklyTeamCommits.map((w) => w.count)}
          href="/commits"
        />
        <KpiTile
          label="열린 머지 리퀘스트"
          value={fmtInt(openMRs.length)}
          unit="건"
          hint={`리뷰 대기 ${needsReview} · 승인됨 ${approvedMRs.length} · 이번 주 머지 ${mergedThisWeek} (지난주 ${mergedLastWeek})`}
          icon={GitPullRequestIcon}
          tone="orange"
          spark={weeklyThroughput.map((w) => w.merged)}
          href="/merge-requests"
        />
        <KpiTile
          label="파이프라인 성공률"
          value={fmtPct(successRate7d, 1)}
          hint={`7일간 ${fmtInt(pipelines7d)}회 실행`}
          trend={trendOf(successRate7d, successRatePrev7d, { digits: 1, suffix: "pt" })}
          icon={WorkflowIcon}
          tone="sky"
          spark={dailySuccessRate}
          href="/pipelines"
        />
      </KpiGrid>

      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @5xl/main:grid-cols-3">
        <Card className="@container/card @5xl/main:col-span-2">
          <CardHeader>
            <CardTitle>파이프라인 실행</CardTitle>
            <CardDescription>일별 성공 / 실패 건수</CardDescription>
            <CardAction>{control}</CardAction>
          </CardHeader>
          <CardContent>
            <PipelineAreaChart days={dailyPipelines.slice(-range)} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>이번 주 커밋 TOP 5</CardTitle>
            <CardDescription>10/26 ~ 11/1 · 지난주 대비</CardDescription>
            <CardAction>
              <Button variant="ghost" size="sm" render={<Link href="/commits" />}>
                전체 순위
                <ArrowRightIcon />
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <Leaderboard rows={top5} />
          </CardContent>
        </Card>
      </div>

      <Section>
        <Card>
          <CardHeader>
            <CardTitle>최근 1년 커밋 활동</CardTitle>
            <CardDescription>
              30일 커밋 <b className="text-foreground">{fmtInt(commits30d)}</b>개 · 가장 활발했던 날{" "}
              <b className="text-foreground">{fmtDate(busiestDay.date)}</b> ({fmtInt(busiestDay.count)}개)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ContributionHeatmap days={dailyCommits} />
          </CardContent>
        </Card>
      </Section>

      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @3xl/main:grid-cols-2 @6xl/main:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>러너 현황</CardTitle>
            <CardDescription>
              동시 실행 {runnerBusy} / 용량 {runnerCapacity}
            </CardDescription>
            <CardAction>
              <Button variant="ghost" size="sm" render={<Link href="/runners" />}>
                자세히
                <ArrowRightIcon />
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <DonutChart
              data={[
                { key: "online", label: "온라인", value: runnerCounts.online, color: "var(--status-good)" },
                { key: "paused", label: "일시중지", value: runnerCounts.paused, color: "var(--status-warning)" },
                { key: "offline", label: "오프라인", value: runnerCounts.offline, color: "var(--status-critical)" },
              ]}
              centerValue={String(runnerCounts.all)}
              centerLabel="러너"
              legend="bottom"
            />
            <div>
              <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
                <span>사용 중인 슬롯</span>
                <span className="tabular-nums">{fmtPct((runnerBusy / runnerCapacity) * 100, 0)}</span>
              </div>
              <div className="flex h-2 gap-0.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-tone-teal" style={{ width: `${(runnerBusy / runnerCapacity) * 100}%` }} />
              </div>
            </div>
            <ul className="flex flex-col gap-1.5 text-sm">
              {runners.filter((r) => r.status !== "online").map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-2">
                  <span className="truncate font-mono text-[13px]">{r.name}</span>
                  <StatusPill
                    status={r.status === "offline" ? "critical" : "warning"}
                    label={r.status === "offline" ? "오프라인" : "일시중지"}
                    icon={r.status === "offline" ? CircleXIcon : CirclePauseIcon}
                    size="xs"
                  />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>최근 활동</CardTitle>
            <CardDescription>푸시, 머지, 파이프라인, 인시던트</CardDescription>
          </CardHeader>
          <CardContent>
            <ActivityFeed items={activityFeed.slice(0, 8)} />
          </CardContent>
        </Card>

        <Card className="@3xl/main:col-span-2 @6xl/main:col-span-1">
          <CardHeader>
            <CardTitle>주의가 필요한 항목</CardTitle>
            <CardDescription>지금 확인해야 할 것들</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-1.5">
            {attention.map((a) => {
              const s = STATUS[a.status]
              return (
                <Link
                  key={a.label}
                  href={a.href}
                  className="group flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors hover:bg-muted/60"
                >
                  <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", s.soft, s.text)}>
                    <a.icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1 leading-tight">
                    <div className="truncate text-sm font-bold">{a.label}</div>
                    <div className="truncate text-xs text-muted-foreground">{a.detail}</div>
                  </div>
                  {a.status === "good" ? (
                    <CircleCheckIcon className="size-4 shrink-0 text-emerald-600 dark:text-emerald-300" />
                  ) : (
                    <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  )}
                </Link>
              )
            })}
          </CardContent>
          <CardFooter className="text-xs text-muted-foreground">
            모든 수치는 lib/mock-data.ts의 모의 데이터이며 실제 시스템과 연결되어 있지 않습니다.
          </CardFooter>
        </Card>
      </div>
    </>
  )
}
