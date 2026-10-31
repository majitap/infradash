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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
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
          <h2 className="text-lg font-extrabold tracking-tight">커밋 순위</h2>
          <p className="text-sm text-muted-foreground">
            {periodLabel} ({rangeLabel}) · 기본 브랜치 기준, 머지 커밋 제외
          </p>
        </div>
        <ToggleGroup
          multiple={false}
          value={[period]}
          onValueChange={(v) => setPeriod((v[0] as Period) ?? "thisWeek")}
          variant="outline"
          aria-label="집계 기간"
        >
          {PERIODS.map((p) => (
            <ToggleGroupItem key={p} value={p} className="px-3">
              {PERIOD_LABELS[p]}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
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
          hint={`커미터 ${committers.length}명 중`}
          icon={UsersIcon}
          tone="indigo"
        />
        <KpiTile
          label="1인당 평균 커밋"
          value={perDev.toFixed(1)}
          unit="개"
          hint="활동 개발자 기준"
          icon={GitBranchIcon}
          tone="sky"
        />
        <KpiTile
          label="최장 연속 커밋"
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

      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @5xl/main:grid-cols-5">
        <Card className="@5xl/main:col-span-3">
          <CardHeader>
            <CardTitle>4위 ~ 10위</CardTitle>
            <CardDescription>{periodLabel} 커밋 수 · 이전 기간 대비 증감</CardDescription>
          </CardHeader>
          <CardContent>
            <Leaderboard rows={rows.slice(3)} startRank={4} showPrevious={period !== "12w"} />
          </CardContent>
        </Card>
        <Card className="@5xl/main:col-span-2">
          <CardHeader>
            <CardTitle>주간 팀 커밋 추이</CardTitle>
            <CardDescription>최근 12주 · 이번 주는 토요일 오전까지</CardDescription>
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
            <div>
              <div className="mb-2 text-sm font-bold">연속 커밋 스트릭</div>
              <ul className="flex flex-col gap-1.5">
                {topStreaks.map((u, i) => (
                  <li key={u.id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="flex items-center gap-2">
                      <span className="w-4 text-xs text-muted-foreground tabular-nums">{i + 1}</span>
                      <span className="font-medium">{u.name}</span>
                      <span className="text-xs text-muted-foreground">{u.department}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 font-bold text-orange-600 tabular-nums dark:text-orange-300">
                      <FlameIcon className="size-3.5" />
                      {u.streakDays}일
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <SectionHeader title="활동 패턴" description="언제, 어디에, 누가 커밋하는지" />
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @3xl/main:grid-cols-2 @6xl/main:grid-cols-4">
        <Card className="@6xl/main:col-span-2">
          <CardHeader>
            <CardTitle>커밋 시간대</CardTitle>
            <CardDescription>최근 12주 · 요일 × 시간대 평균 커밋 수</CardDescription>
          </CardHeader>
          <CardContent>
            <HourHeatmap matrix={hourlyMatrix} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>프로젝트별 커밋</CardTitle>
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
        <Card>
          <CardHeader>
            <CardTitle>부서별 커밋</CardTitle>
            <CardDescription>최근 30일</CardDescription>
          </CardHeader>
          <CardContent>
            <BarList
              color="var(--chart-7)"
              items={commitsByDepartment.map((d) => ({ key: d.department, label: d.department, value: d.commits }))}
            />
          </CardContent>
        </Card>
      </div>

      <Section>
        <Card>
          <CardHeader>
            <CardTitle>최근 1년 커밋 히트맵</CardTitle>
            <CardDescription>팀 전체 · 공휴일과 주말은 옅게 표시됩니다</CardDescription>
          </CardHeader>
          <CardContent>
            <ContributionHeatmap days={dailyCommits} />
          </CardContent>
        </Card>
      </Section>

      <Section>
        <Card>
          <CardHeader>
            <CardTitle>최근 커밋</CardTitle>
            <CardDescription>전체 프로젝트 · 최근 {recentCommits.length}개</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader className="bg-muted/60">
                  <TableRow>
                    <TableHead className="min-w-72">커밋</TableHead>
                    <TableHead>작성자</TableHead>
                    <TableHead className="hidden lg:table-cell">프로젝트</TableHead>
                    <TableHead className="hidden text-right md:table-cell">변경</TableHead>
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
                          <div className="truncate font-medium">{c.message}</div>
                          <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                            <code className="rounded bg-muted px-1 py-px font-mono">{c.sha}</code>
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
                          <span className="text-emerald-700 dark:text-emerald-300">+{c.additions}</span>{" "}
                          <span className="text-rose-700 dark:text-rose-300">-{c.deletions}</span>
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
