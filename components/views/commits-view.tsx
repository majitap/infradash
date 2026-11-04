"use client"

import * as React from "react"
import {
  CircleCheckIcon,
  CircleXIcon,
  FlameIcon,
  GitBranchIcon,
  GitCommitHorizontalIcon,
  LoaderCircleIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react"

import { TimeBarChart } from "@/components/charts/time-bar-chart"
import { BarList } from "@/components/dashboard/bar-list"
import { ContributionHeatmap } from "@/components/dashboard/contribution-heatmap"
import { HourHeatmap } from "@/components/dashboard/hour-heatmap"
import { KpiGrid, KpiTile } from "@/components/dashboard/kpi-tile"
import { Leaderboard } from "@/components/dashboard/leaderboard"
import { Podium } from "@/components/dashboard/podium"
import { ProjectRef } from "@/components/dashboard/project-ref"
import { Section, SectionHeader } from "@/components/dashboard/section-header"
import { StatusPill } from "@/components/dashboard/status-pill"
import { trendOf } from "@/components/dashboard/trend-badge"
import { UserCell } from "@/components/dashboard/user-avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { fmtDateShort, fmtInt, fmtWeekRange, relativeTime } from "@/lib/format"
import {
  PERIOD_LABELS,
  WEEK_STARTS,
  commitsByDepartment,
  commitsByProject,
  committers,
  dailyCommits,
  hourlyMatrix,
  leaderboard,
  recentCommits,
  topStreaks,
  weeklyTeamCommits,
  type Period,
} from "@/lib/mock-data"
import type { Status } from "@/lib/tones"
import { cn } from "@/lib/utils"

const PERIODS = Object.keys(PERIOD_LABELS) as Period[]

const PIPELINE_META: Record<string, { status: Status; label: string; icon: LucideIcon }> = {
  success: { status: "good", label: "성공", icon: CircleCheckIcon },
  failed: { status: "critical", label: "실패", icon: CircleXIcon },
  running: { status: "info", label: "실행 중", icon: LoaderCircleIcon },
  pending: { status: "neutral", label: "대기", icon: LoaderCircleIcon },
}

function periodRange(period: Period): [number, number] {
  return period === "thisWeek" ? [11, 12] : period === "lastWeek" ? [10, 11] : period === "4w" ? [8, 12] : [0, 12]
}

export function CommitsView() {
  const [period, setPeriod] = React.useState<Period>("thisWeek")
  const rows = leaderboard(period, 10)
  const [from, to] = periodRange(period)
  const total = weeklyTeamCommits.slice(from, to).reduce((s, w) => s + w.count, 0)
  const prevTotal =
    period === "12w" ? 0 : weeklyTeamCommits.slice(from - (to - from), from).reduce((s, w) => s + w.count, 0)
  const activeDevs = committers.filter((u) => u.weeklyCommits.slice(from, to).some((c) => c > 0)).length
  const perDev = activeDevs ? total / activeDevs : 0
  const streakLeader = topStreaks[0]
  const periodLabel = PERIOD_LABELS[period]
  const rangeLabel =
    period === "thisWeek" || period === "lastWeek"
      ? fmtWeekRange(WEEK_STARTS[from])
      : `${fmtDateShort(WEEK_STARTS[from])} ~ 11/1`

  const weeklyData = weeklyTeamCommits.map((w) => ({ week: w.weekStart, commits: w.count }))

  return (
    <>
      <Section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-[-0.022em] text-foreground">엔지니어링 기여 리더보드</h2>
          <p className="text-[13px] text-muted-foreground">
            {periodLabel} ({rangeLabel}) · 기본 브랜치 기준, 자동 머지 커밋 제외
          </p>
        </div>
        <div
          role="group"
          aria-label="집계 기간"
          className="inline-flex items-center rounded-[11px] bg-black/[0.05] p-[3px] dark:bg-white/[0.07]"
        >
          {PERIODS.map((p) => {
            const active = period === p
            return (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={cn(
                  "rounded-[8.5px] px-3 py-1 text-[13px] font-medium transition-all duration-150",
                  active
                    ? "bg-white font-semibold text-foreground shadow-[0_1px_3px_rgba(0,0,0,0.09),0_1px_1px_rgba(0,0,0,0.04)] dark:bg-white/[0.14] dark:text-white"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {PERIOD_LABELS[p]}
              </button>
            )
          })}
        </div>
      </Section>

      <KpiGrid>
        <KpiTile
          label={`${periodLabel} 커밋`}
          value={fmtInt(total)}
          unit="개"
          hint={prevTotal ? `이전 기간 ${fmtInt(prevTotal)}개` : "12주 누적"}
          trend={prevTotal ? trendOf(total, prevTotal, { pct: true }) : undefined}
          icon={GitCommitHorizontalIcon}
          tone="violet"
          spark={weeklyTeamCommits.map((w) => w.count)}
        />
        <KpiTile
          label="활동 개발자"
          value={fmtInt(activeDevs)}
          unit="명"
          hint={`전체 커미터 ${committers.length}명 중`}
          icon={UsersIcon}
          tone="indigo"
        />
        <KpiTile
          label="1인당 평균 커밋"
          value={perDev.toFixed(1)}
          unit="개"
          hint="기간 내 활동 개발자 기준"
          icon={GitBranchIcon}
          tone="sky"
        />
        <KpiTile
          label="최장 연속 스트릭"
          value={fmtInt(streakLeader.streakDays)}
          unit="일"
          hint={`${streakLeader.name} · ${streakLeader.department}`}
          icon={FlameIcon}
          tone="orange"
        />
      </KpiGrid>

      <Section>
        <Podium rows={rows} periodLabel={periodLabel} />
      </Section>

      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @5xl/main:grid-cols-12">
        <Card className="@5xl/main:col-span-7">
          <CardHeader>
            <CardTitle>4위 ~ 10위 기여자</CardTitle>
            <CardDescription>{periodLabel} 커밋 수 · 직전 동일 기간 대비</CardDescription>
          </CardHeader>
          <CardContent>
            <Leaderboard rows={rows.slice(3)} startRank={4} showPrevious={period !== "12w"} />
          </CardContent>
        </Card>

        <Card className="@5xl/main:col-span-5">
          <CardHeader>
            <CardTitle>주간 팀 커밋 추이</CardTitle>
            <CardDescription>최근 12주 · 이번 주는 토요일 오전 집계 기준</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <TimeBarChart
              data={weeklyData}
              xKey="week"
              series={[{ key: "commits", label: "커밋", color: "var(--chart-7)" }]}
              xFormatter={fmtDateShort}
              labelFormatter={fmtWeekRange}
              valueFormatter={fmtInt}
              highlightLast
              className="h-52"
            />
            <div className="apple-inset-well rounded-2xl p-3.5">
              <div className="mb-2 text-xs font-semibold tracking-tight text-muted-foreground">연속 커밋 스트릭 TOP 5</div>
              <ul className="flex flex-col gap-1.5">
                {topStreaks.map((u, i) => (
                  <li key={u.id} className="flex items-center justify-between gap-2 text-[13px]">
                    <span className="flex items-center gap-2">
                      <span className="w-4 text-xs font-semibold text-muted-foreground tabular-nums">{i + 1}</span>
                      <span className="font-semibold text-foreground">{u.name}</span>
                      <span className="text-xs text-muted-foreground">{u.department}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-tone-orange/10 px-2 py-0.5 text-xs font-semibold text-tone-orange tabular-nums">
                      <FlameIcon className="size-3" />
                      {u.streakDays}일
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <SectionHeader title="활동 패턴 인텔리전스" description="요일·시간대별 리듬과 프로젝트 및 부서별 기여 분포" />
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @3xl/main:grid-cols-2 @6xl/main:grid-cols-12">
        <Card className="@6xl/main:col-span-6">
          <CardHeader>
            <CardTitle>요일 × 시간대 커밋 밀도</CardTitle>
            <CardDescription>최근 12주 시간대별 평균 커밋 분포</CardDescription>
          </CardHeader>
          <CardContent>
            <HourHeatmap matrix={hourlyMatrix} />
          </CardContent>
        </Card>

        <Card className="@6xl/main:col-span-3">
          <CardHeader>
            <CardTitle>저장소별 커밋</CardTitle>
            <CardDescription>최근 30일 상위 8개</CardDescription>
          </CardHeader>
          <CardContent>
            <BarList
              color="var(--chart-7)"
              items={commitsByProject.map((p) => ({
                key: p.project,
                label: <ProjectRef name={p.project} showGroup={false} />,
                value: p.commits,
                secondary: p.group,
              }))}
            />
          </CardContent>
        </Card>

        <Card className="@6xl/main:col-span-3">
          <CardHeader>
            <CardTitle>부서별 커밋</CardTitle>
            <CardDescription>최근 30일 조직 기여</CardDescription>
          </CardHeader>
          <CardContent>
            <BarList
              color="var(--chart-1)"
              items={commitsByDepartment.map((d) => ({ key: d.department, label: d.department, value: d.commits }))}
            />
          </CardContent>
        </Card>
      </div>

      <Section>
        <Card>
          <CardHeader>
            <CardTitle>최근 1년 커밋 히트맵</CardTitle>
            <CardDescription>조직 전체 일간 활동 기록</CardDescription>
          </CardHeader>
          <CardContent>
            <ContributionHeatmap days={dailyCommits} />
          </CardContent>
        </Card>
      </Section>

      <Section>
        <Card>
          <CardHeader>
            <CardTitle>최근 커밋 스트림</CardTitle>
            <CardDescription>전체 저장소 최근 {recentCommits.length}개 커밋</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-2xl border border-black/[0.055] dark:border-white/[0.065]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-72">커밋 메시지</TableHead>
                    <TableHead>작성자</TableHead>
                    <TableHead className="hidden lg:table-cell">저장소</TableHead>
                    <TableHead className="hidden text-right md:table-cell">코드 변경</TableHead>
                    <TableHead>파이프라인</TableHead>
                    <TableHead className="text-right">시각</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentCommits.map((c) => {
                    const meta = PIPELINE_META[c.pipeline]
                    return (
                      <TableRow key={c.sha}>
                        <TableCell>
                          <div className="truncate font-semibold text-foreground">{c.message}</div>
                          <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                            <code className="rounded-md bg-black/[0.045] px-1.5 py-0.5 font-mono text-[11px] dark:bg-white/[0.07]">
                              {c.sha}
                            </code>
                            <span className="inline-flex items-center gap-1 font-mono">
                              <GitBranchIcon className="size-3" />
                              {c.branch}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <UserCell name={c.author.name} hue={c.author.hue} size="sm" />
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <ProjectRef name={c.project} />
                        </TableCell>
                        <TableCell className="hidden text-right font-mono text-xs tabular-nums md:table-cell">
                          <span className="font-semibold text-tone-emerald">+{c.additions}</span>{" "}
                          <span className="font-semibold text-tone-rose">-{c.deletions}</span>
                        </TableCell>
                        <TableCell>
                          <StatusPill status={meta.status} label={meta.label} icon={meta.icon} size="xs" />
                        </TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground whitespace-nowrap">{relativeTime(c.at)}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </Section>
    </>
  )
}
