"use client"

import Link from "next/link"
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
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
  SparklesIcon,
  TimerIcon,
  UserCogIcon,
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
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { fmtDate, fmtInt, fmtMinutes, fmtPct, fmtSize } from "@/lib/format"
import {
  MONTHS_12,
  activeProjects,
  activeUsers,
  activityFeed,
  approvedMRs,
  busiestDay,
  commits30d,
  commitsLastWeek,
  commitsThisWeek,
  dailyCommits,
  dailyPipelines,
  durationTrend,
  joiners,
  leavers,
  leaderboard,
  mergedLastWeek,
  mergedThisWeek,
  openIncidents,
  openMRs,
  pendingRequestCount,
  pipelines7d,
  runnerBusy,
  runnerCapacity,
  runnerCounts,
  runners,
  serviceUptime,
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

type Attention = { label: string; detail: string; badge?: string; status: Status; href: string; icon: LucideIcon }

function ExecutiveHero() {
  const s1 = openIncidents.find((i) => i.severity === "S1")
  const avgUptime = serviceUptime.reduce((s, u) => s + u.uptime, 0) / serviceUptime.length
  const slotPct = Math.round((runnerBusy / runnerCapacity) * 100)

  return (
    <Section>
      <div className="grid grid-cols-1 gap-4 @5xl/main:grid-cols-12">
        {/* Cupertino Control Plane Summary */}
        <Card className="relative overflow-hidden py-5 @5xl/main:col-span-7">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -right-20 size-72 rounded-full bg-gradient-to-br from-[#007AFF]/12 via-[#5856D6]/8 to-transparent blur-2xl dark:from-[#0A84FF]/18"
          />
          <CardContent className="relative flex h-full flex-col justify-between gap-4">
            <div className="flex flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-tone-indigo/10 px-2.5 py-0.5 text-[11.5px] font-semibold text-tone-indigo dark:bg-tone-indigo/16">
                  <SparklesIcon className="size-3" />
                  GitLab {upgradePlan.edition} · {upgradePlan.currentVersion}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-black/[0.04] px-2.5 py-0.5 text-[11.5px] font-medium text-muted-foreground dark:bg-white/[0.06]">
                  PostgreSQL {upgradePlan.postgresVersion} · Gitaly {upgradePlan.gitalyNodes} Nodes
                </span>
              </div>
              <h2 className="mt-1 text-xl font-bold tracking-[-0.028em] text-foreground sm:text-[22px]">
                엔지니어링 생산성과 인프라 상태 요약
              </h2>
              <p className="text-[13.5px] leading-relaxed text-muted-foreground">
                활성 저장소 {activeProjects.length}개와 러너 {runnerCounts.all}대의 실시간 텔레메트리 및 거버넌스 지표를 한 화면에 배치했습니다.
              </p>
            </div>

            <div className="apple-inset-well grid grid-cols-2 gap-3 rounded-2xl p-3 sm:grid-cols-4">
              <Link href="/incidents" className="group rounded-xl px-2.5 py-1.5 transition-colors hover:bg-white/80 dark:hover:bg-white/[0.06]">
                <div className="flex items-center gap-1.5 text-[11.5px] font-medium text-muted-foreground">
                  <span className="size-1.5 rounded-full bg-status-good" />
                  90일 평균 가용성
                </div>
                <div className="mt-0.5 text-[16px] font-bold tracking-[-0.02em] text-foreground tabular-nums">
                  {fmtPct(avgUptime, 2)}
                </div>
              </Link>
              <Link href="/projects" className="group rounded-xl px-2.5 py-1.5 transition-colors hover:bg-white/80 dark:hover:bg-white/[0.06]">
                <div className="text-[11.5px] font-medium text-muted-foreground">활성 프로젝트</div>
                <div className="mt-0.5 text-[16px] font-bold tracking-[-0.02em] text-foreground tabular-nums">
                  {activeProjects.length}개
                </div>
              </Link>
              <Link href="/runners" className="group rounded-xl px-2.5 py-1.5 transition-colors hover:bg-white/80 dark:hover:bg-white/[0.06]">
                <div className="text-[11.5px] font-medium text-muted-foreground">러너 슬롯 부하</div>
                <div className="mt-0.5 text-[16px] font-bold tracking-[-0.02em] text-foreground tabular-nums">
                  {slotPct}% <span className="text-xs font-normal text-muted-foreground">({runnerBusy}/{runnerCapacity})</span>
                </div>
              </Link>
              <Link href="/access" className="group rounded-xl px-2.5 py-1.5 transition-colors hover:bg-white/80 dark:hover:bg-white/[0.06]">
                <div className="flex items-center justify-between text-[11.5px] font-medium text-muted-foreground">
                  <span>권한 결재 대기</span>
                  <ArrowUpRightIcon className="size-3 opacity-50 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
                <div className="mt-0.5 text-[16px] font-bold tracking-[-0.02em] text-tone-orange tabular-nums">
                  {pendingRequestCount}건
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Dynamic Island Critical Incident Card */}
        {s1 ? (
          <Card className="relative overflow-hidden py-5 ring-1 ring-[#FF3B30]/25 dark:ring-[#FF453A]/30 @5xl/main:col-span-5">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-20 -right-16 size-64 rounded-full bg-gradient-to-br from-[#FF3B30]/14 via-[#FF9500]/6 to-transparent blur-2xl dark:from-[#FF453A]/20"
            />
            <CardContent className="relative flex h-full flex-col justify-between gap-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex size-9 shrink-0 items-center justify-center rounded-[11px] bg-[#FF3B30]/12 text-[#FF3B30] dark:bg-[#FF453A]/18 dark:text-[#FF6961]">
                    <SirenIcon className="size-4.5 stroke-[2.2]" />
                    <span className="absolute -top-0.5 -right-0.5 size-2.5 animate-ping rounded-full bg-[#FF3B30] opacity-75" />
                    <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-[#FF3B30]" />
                  </span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="rounded-full bg-[#FF3B30] px-2 py-0.5 text-[10.5px] font-bold text-white">S1 긴급</span>
                      <span className="font-mono text-xs font-semibold text-muted-foreground">{s1.id}</span>
                    </div>
                    <h3 className="mt-0.5 text-[15.5px] font-bold tracking-[-0.02em] text-foreground">{s1.title}</h3>
                  </div>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#FF3B30]/10 px-2.5 py-1 text-xs font-semibold text-[#DC2626] tabular-nums dark:bg-[#FF453A]/16 dark:text-[#FF6961]">
                  <TimerIcon className="size-3.5" />
                  {fmtMinutes(s1.durationMin)} 경과
                </span>
              </div>

              <p className="rounded-xl bg-black/[0.028] px-3.5 py-2.5 text-[13px] leading-relaxed text-foreground/85 dark:bg-white/[0.04]">
                {s1.impact}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <UserAvatar name={s1.owner.name} hue={s1.owner.hue} size="xs" />
                  <span>
                    온콜 리드 <b className="font-semibold text-foreground">{s1.owner.name}</b> · <span className="font-mono">{s1.service}</span>
                  </span>
                </div>
                <Button size="sm" className="rounded-full px-3.5 text-xs font-semibold" render={<Link href="/incidents" />}>
                  인시던트 대응실
                  <ArrowRightIcon className="size-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="justify-center py-5 @5xl/main:col-span-5">
            <CardContent className="flex items-center gap-3">
              <CircleCheckIcon className="size-8 text-status-good" />
              <div>
                <div className="font-semibold">진행 중인 긴급 인시던트 없음</div>
                <div className="text-xs text-muted-foreground">모든 핵심 GitLab 서비스가 정상 범위에서 응답하고 있습니다.</div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
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

  const sliceDays = dailyPipelines.slice(-range)
  const rangeSuccess = sliceDays.reduce((s, d) => s + d.success, 0)
  const rangeFailed = sliceDays.reduce((s, d) => s + d.failed, 0)
  const rangeRate = (rangeSuccess / Math.max(1, rangeSuccess + rangeFailed)) * 100
  const avgWeeklyCommits = Math.round(weeklyTeamCommits.reduce((s, w) => s + w.count, 0) / weeklyTeamCommits.length)

  const attention: Attention[] = [
    ...(openIncidents.length
      ? [
          {
            label: `인시던트 ${openIncidents.length}건 진행 중`,
            detail: openIncidents.map((i) => `${i.id} (${i.severity})`).join(" · "),
            badge: "즉시 확인",
            status: "critical" as Status,
            href: "/incidents",
            icon: SirenIcon,
          },
        ]
      : []),
    {
      label: `치명 보안 취약점 ${critical}건`,
      detail: "시크릿 노출 1 · SQL 인젝션 1 미폐기",
      badge: "보안",
      status: critical > 0 ? "critical" : "good",
      href: "/security",
      icon: ShieldAlertIcon,
    },
    {
      label: `권한 승인 요청 ${pendingRequestCount}건 대기`,
      detail: "높은 권한(Owner·관리자) 결재 포함",
      badge: "결재",
      status: pendingRequestCount > 0 ? "serious" : "good",
      href: "/access",
      icon: UserCogIcon,
    },
    {
      label: `오프라인 러너 ${offlineRunners.length}대`,
      detail: offlineRunners.map((r) => r.name).join(", "),
      badge: "인프라",
      status: offlineRunners.length ? "warning" : "good",
      href: "/runners",
      icon: ServerIcon,
    },
    {
      label: `장기 미결 MR ${staleMRs.length}건 (10일+)`,
      detail: `최장 대기 !${staleMRs[0]?.iid} · 리뷰 병목 점검`,
      status: staleMRs.length > 3 ? "warning" : "neutral",
      href: "/merge-requests",
      icon: GitPullRequestIcon,
    },
    {
      label: `스토리지 점유율 ${storagePct.toFixed(0)}%`,
      detail: `${fmtSize(storageTotalMb)} / ${fmtSize(storageQuotaMb)} · D-15 정기 업그레이드`,
      status: storagePct > 80 ? "warning" : "info",
      href: "/storage",
      icon: HardDriveIcon,
    },
  ]

  return (
    <>
      <ExecutiveHero />

      {/* 4 Signature Apple Bento KPIs */}
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
          hint={`지난주 ${fmtInt(commitsLastWeek)}개`}
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
          hint={`리뷰 대기 ${needsReview} · 승인 ${approvedMRs.length} · 주간 머지 ${mergedThisWeek}`}
          trend={trendOf(mergedThisWeek, mergedLastWeek, { suffix: "건" })}
          icon={GitPullRequestIcon}
          tone="orange"
          spark={weeklyThroughput.map((w) => w.merged)}
          href="/merge-requests"
        />
        <KpiTile
          label="파이프라인 성공률"
          value={fmtPct(successRate7d, 1)}
          hint={`최근 7일 ${fmtInt(pipelines7d)}회 실행`}
          trend={trendOf(successRate7d, successRatePrev7d, { digits: 1, suffix: "pt" })}
          icon={WorkflowIcon}
          tone="sky"
          spark={dailySuccessRate}
          href="/pipelines"
        />
      </KpiGrid>

      {/* Primary Asymmetric Bento: 7 cols CI/CD Telemetry + 5 cols Priority Action Center */}
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @5xl/main:grid-cols-12">
        <Card className="@container/card @5xl/main:col-span-7">
          <CardHeader>
            <CardTitle>CI/CD 파이프라인 인텔리전스</CardTitle>
            <CardDescription>선택 기간 내 일별 성공 · 실패 추이와 빌드 안정성</CardDescription>
            <CardAction>{control}</CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="apple-inset-well grid grid-cols-3 gap-3 rounded-2xl px-4 py-3 sm:grid-cols-4">
              <div>
                <div className="text-[11.5px] font-medium text-muted-foreground">성공 실행</div>
                <div className="mt-0.5 text-[16px] font-bold tracking-[-0.02em] text-foreground tabular-nums">
                  {fmtInt(rangeSuccess)}
                </div>
              </div>
              <div>
                <div className="text-[11.5px] font-medium text-muted-foreground">실패 실행</div>
                <div className="mt-0.5 text-[16px] font-bold tracking-[-0.02em] text-tone-rose tabular-nums">
                  {fmtInt(rangeFailed)}
                </div>
              </div>
              <div>
                <div className="text-[11.5px] font-medium text-muted-foreground">기간 성공률</div>
                <div className="mt-0.5 text-[16px] font-bold tracking-[-0.02em] text-foreground tabular-nums">
                  {fmtPct(rangeRate, 1)}
                </div>
              </div>
              <div className="hidden sm:block">
                <div className="text-[11.5px] font-medium text-muted-foreground">중앙값 소요</div>
                <div className="mt-0.5 text-[16px] font-bold tracking-[-0.02em] text-foreground tabular-nums">
                  {durationTrend[11].p50.toFixed(1)}분
                </div>
              </div>
            </div>
            <PipelineAreaChart days={sliceDays} className="aspect-auto h-64 w-full" />
          </CardContent>
        </Card>

        <Card className="@5xl/main:col-span-5">
          <CardHeader>
            <CardTitle>우선 확인 센터</CardTitle>
            <CardDescription>운영자 조치가 필요한 핵심 알림 및 거버넌스 항목</CardDescription>
            <CardAction>
              <Link
                href="/upgrade"
                className="inline-flex items-center gap-1 rounded-full bg-tone-violet/10 px-2.5 py-1 text-[11.5px] font-semibold text-tone-violet transition-colors hover:bg-tone-violet/16"
              >
                <CircleArrowUpIcon className="size-3.5" />
                업그레이드 D-15
              </Link>
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col justify-between gap-2">
            <div className="flex flex-col gap-1.5">
              {attention.map((a) => {
                const s = STATUS[a.status]
                return (
                  <Link
                    key={a.label}
                    href={a.href}
                    className="group flex items-center gap-3 rounded-2xl bg-black/[0.02] px-3.5 py-2.5 ring-1 ring-black/[0.04] transition-all duration-150 hover:bg-black/[0.045] dark:bg-white/[0.028] dark:ring-white/[0.05] dark:hover:bg-white/[0.06]"
                  >
                    <span className={cn("flex size-8.5 shrink-0 items-center justify-center rounded-[10px]", s.soft, s.text)}>
                      <a.icon className="size-4 stroke-[2.1]" />
                    </span>
                    <div className="min-w-0 flex-1 leading-snug">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-[13.5px] font-semibold tracking-[-0.01em] text-foreground">{a.label}</span>
                        {a.badge && (
                          <span className={cn("rounded-full px-1.5 py-px text-[10px] font-semibold", s.soft, s.text)}>
                            {a.badge}
                          </span>
                        )}
                      </div>
                      <div className="truncate text-[12px] text-muted-foreground">{a.detail}</div>
                    </div>
                    <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground/50 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-foreground" />
                  </Link>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3-Column Balanced Bento: Runner Cluster + Leaderboard + Live Activity */}
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @3xl/main:grid-cols-2 @6xl/main:grid-cols-12">
        <Card className="@6xl/main:col-span-4">
          <CardHeader>
            <CardTitle>러너 클러스터 용량</CardTitle>
            <CardDescription>
              동시 실행 슬롯 {runnerBusy} / {runnerCapacity} 사용 중
            </CardDescription>
            <CardAction>
              <Button variant="ghost" size="sm" className="rounded-full text-xs text-muted-foreground hover:text-foreground" render={<Link href="/runners" />}>
                전체 보기
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
              centerLabel="전체 러너"
              legend="bottom"
            />
            <div className="apple-inset-well rounded-2xl p-3">
              <div className="mb-1.5 flex justify-between text-xs">
                <span className="font-medium text-muted-foreground">클러스터 슬롯 점유율</span>
                <span className="font-semibold text-foreground tabular-nums">
                  {fmtPct((runnerBusy / runnerCapacity) * 100, 0)}
                </span>
              </div>
              <div className="flex h-2 overflow-hidden rounded-full bg-black/[0.06] dark:bg-white/[0.08]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#007AFF] to-[#00C7BE]"
                  style={{ width: `${(runnerBusy / runnerCapacity) * 100}%` }}
                />
              </div>
            </div>
            <ul className="flex flex-col gap-1.5 text-sm">
              {runners
                .filter((r) => r.status !== "online")
                .map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-2 rounded-xl px-2 py-1 hover:bg-black/[0.025] dark:hover:bg-white/[0.03]">
                    <span className="truncate font-mono text-[12.5px] font-medium text-foreground/90">{r.name}</span>
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

        <Card className="@6xl/main:col-span-4">
          <CardHeader>
            <CardTitle>주간 커밋 리더보드</CardTitle>
            <CardDescription>10/26 ~ 11/1 · 지난주 대비 증감</CardDescription>
            <CardAction>
              <Button variant="ghost" size="sm" className="rounded-full text-xs text-muted-foreground hover:text-foreground" render={<Link href="/commits" />}>
                전체 순위
                <ArrowRightIcon />
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <Leaderboard rows={top5} />
          </CardContent>
        </Card>

        <Card className="@3xl/main:col-span-2 @6xl/main:col-span-4">
          <CardHeader>
            <CardTitle>실시간 운영 스트림</CardTitle>
            <CardDescription>푸시, 머지, 파이프라인 및 보안 이벤트</CardDescription>
            <CardAction>
              <Button variant="ghost" size="sm" className="rounded-full text-xs text-muted-foreground hover:text-foreground" render={<Link href="/audit" />}>
                감사 로그
                <ArrowRightIcon />
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <ActivityFeed items={activityFeed.slice(0, 7)} />
          </CardContent>
        </Card>
      </div>

      {/* Annual Contribution Rhythm Bento: Integrated Stats + Full-Width Crystal Matrix */}
      <Section>
        <Card>
          <CardHeader>
            <CardTitle>연간 엔지니어링 기여 리듬</CardTitle>
            <CardDescription>최근 52주 조직 전체 커밋 밀도 및 피크 데이 분석</CardDescription>
            <CardAction>
              <Button variant="ghost" size="sm" className="rounded-full text-xs text-muted-foreground hover:text-foreground" render={<Link href="/commits" />}>
                패턴 상세 분석
                <ArrowRightIcon />
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 items-center gap-6 @5xl/main:grid-cols-12">
              <div className="apple-inset-well grid grid-cols-3 gap-3 rounded-2xl p-4 @5xl/main:col-span-3 @5xl/main:grid-cols-1">
                <div>
                  <div className="text-[11.5px] font-medium text-muted-foreground">최근 30일 누적</div>
                  <div className="mt-0.5 text-2xl font-bold tracking-[-0.03em] text-foreground tabular-nums">
                    {fmtInt(commits30d)}
                    <span className="ml-1 text-xs font-medium text-muted-foreground">커밋</span>
                  </div>
                </div>
                <div className="border-black/[0.05] @5xl/main:border-t @5xl/main:pt-3 dark:border-white/[0.06]">
                  <div className="text-[11.5px] font-medium text-muted-foreground">가장 활발했던 날</div>
                  <div className="mt-0.5 text-[15px] font-bold tracking-[-0.02em] text-foreground">
                    {fmtDate(busiestDay.date)}{" "}
                    <span className="text-xs font-semibold text-tone-sky tabular-nums">({fmtInt(busiestDay.count)}개)</span>
                  </div>
                </div>
                <div className="border-black/[0.05] @5xl/main:border-t @5xl/main:pt-3 dark:border-white/[0.06]">
                  <div className="text-[11.5px] font-medium text-muted-foreground">12주 주간 평균</div>
                  <div className="mt-0.5 text-[15px] font-bold tracking-[-0.02em] text-foreground tabular-nums">
                    {fmtInt(avgWeeklyCommits)}개 / 주
                  </div>
                </div>
              </div>

              <div className="@5xl/main:col-span-9">
                <ContributionHeatmap days={dailyCommits} />
              </div>
            </div>
          </CardContent>
        </Card>
      </Section>
    </>
  )
}
