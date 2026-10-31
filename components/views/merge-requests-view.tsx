"use client"

import * as React from "react"
import {
  CircleCheckIcon,
  CircleDashedIcon,
  CircleDotIcon,
  CircleXIcon,
  GitMergeIcon,
  GitPullRequestIcon,
  HourglassIcon,
  LoaderCircleIcon,
  MessageSquareWarningIcon,
  TimerIcon,
  type LucideIcon,
} from "lucide-react"

import { TimeBarChart } from "@/components/charts/time-bar-chart"
import { TimeLineChart } from "@/components/charts/time-line-chart"
import { BarList } from "@/components/dashboard/bar-list"
import { KpiGrid, KpiTile } from "@/components/dashboard/kpi-tile"
import { ProjectRef } from "@/components/dashboard/project-ref"
import { StatusPill } from "@/components/dashboard/status-pill"
import { trendOf } from "@/components/dashboard/trend-badge"
import { UserAvatar, UserCell } from "@/components/dashboard/user-avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fmtDateShort, fmtHours, fmtInt, fmtWeekRange, relativeTime } from "@/lib/format"
import {
  approvedMRs,
  draftMRs,
  firstReviewHours,
  labelCounts,
  medianTimeToMergeHours,
  mergeRequests,
  mergedLastWeek,
  mergedThisWeek,
  mrAgeHours,
  reviewerLoad,
  staleMRs,
  timeToMerge,
  weeklyThroughput,
  type MRLabel,
  type MRState,
  type MergeRequest,
  type PipelineState,
} from "@/lib/mock-data"
import type { Status } from "@/lib/tones"

const STATE_META: Record<MRState, { status: Status; label: string; icon: LucideIcon }> = {
  open: { status: "info", label: "리뷰 대기", icon: CircleDotIcon },
  draft: { status: "neutral", label: "초안", icon: CircleDashedIcon },
  approved: { status: "good", label: "승인됨", icon: CircleCheckIcon },
  changes_requested: { status: "warning", label: "변경 요청", icon: MessageSquareWarningIcon },
}

const PIPELINE_META: Record<PipelineState, { status: Status; label: string; icon: LucideIcon }> = {
  success: { status: "good", label: "성공", icon: CircleCheckIcon },
  failed: { status: "critical", label: "실패", icon: CircleXIcon },
  running: { status: "info", label: "실행 중", icon: LoaderCircleIcon },
  pending: { status: "neutral", label: "대기", icon: HourglassIcon },
  canceled: { status: "neutral", label: "취소", icon: CircleXIcon },
}

const LABEL_CLASS: Record<MRLabel, string> = {
  feature: "bg-tone-indigo/12 text-tone-indigo",
  bug: "bg-tone-rose/12 text-tone-rose",
  chore: "bg-muted text-muted-foreground",
  security: "bg-rose-500/12 text-rose-700 dark:text-rose-300",
  docs: "bg-tone-sky/12 text-tone-sky",
  performance: "bg-tone-emerald/12 text-tone-emerald",
  breaking: "bg-amber-500/14 text-amber-800 dark:text-amber-300",
}

type Filter = "all" | MRState

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "open", label: "리뷰 대기" },
  { value: "approved", label: "승인됨" },
  { value: "changes_requested", label: "변경 요청" },
  { value: "draft", label: "초안" },
]

function count(filter: Filter) {
  return filter === "all" ? mergeRequests.length : mergeRequests.filter((m) => m.state === filter).length
}

function MRRow({ mr }: { mr: MergeRequest }) {
  const state = STATE_META[mr.state]
  const pipe = PIPELINE_META[mr.pipeline]
  const age = mrAgeHours(mr)
  return (
    <TableRow>
      <TableCell className="max-w-96">
        <div className="flex items-center gap-2">
          <span className="truncate font-medium">{mr.title}</span>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <span className="font-mono">!{mr.iid}</span>
          <ProjectRef name={mr.project} showGroup={false} />
          {mr.labels.map((l) => (
            <span key={l} className={`rounded px-1.5 py-px text-[11px] font-bold ${LABEL_CLASS[l]}`}>
              {l}
            </span>
          ))}
        </div>
      </TableCell>
      <TableCell>
        <UserCell name={mr.author.name} hue={mr.author.hue} size="sm" />
      </TableCell>
      <TableCell className="hidden xl:table-cell">
        <div className="flex -space-x-1.5">
          {mr.reviewers.map((r) => (
            <UserAvatar key={r.id} name={r.name} hue={r.hue} size="sm" className="ring-2 ring-card" />
          ))}
        </div>
      </TableCell>
      <TableCell>
        <StatusPill status={state.status} label={state.label} icon={state.icon} size="xs" />
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <StatusPill status={pipe.status} label={pipe.label} icon={pipe.icon} size="xs" />
      </TableCell>
      <TableCell className="hidden text-right font-mono text-xs tabular-nums lg:table-cell">
        <span className="text-emerald-700 dark:text-emerald-300">+{fmtInt(mr.additions)}</span>{" "}
        <span className="text-rose-700 dark:text-rose-300">-{fmtInt(mr.deletions)}</span>
      </TableCell>
      <TableCell className="hidden text-center tabular-nums md:table-cell">
        <span className={mr.approvals >= mr.approvalsRequired ? "font-bold text-emerald-700 dark:text-emerald-300" : "text-muted-foreground"}>
          {mr.approvals}/{mr.approvalsRequired}
        </span>
      </TableCell>
      <TableCell className="text-right text-xs whitespace-nowrap">
        <span className={age > 240 ? "font-bold text-amber-700 dark:text-amber-300" : "text-muted-foreground"}>{relativeTime(mr.createdAt)}</span>
      </TableCell>
    </TableRow>
  )
}

export function MergeRequestsView() {
  const [filter, setFilter] = React.useState<Filter>("all")
  const rows = (filter === "all" ? mergeRequests : mergeRequests.filter((m) => m.state === filter)).sort(
    (a, b) => b.updatedAt.localeCompare(a.updatedAt)
  )
  const needsReview = mergeRequests.filter((m) => m.state === "open" && m.approvals < m.approvalsRequired).length

  return (
    <>
      <KpiGrid>
        <KpiTile
          label="열린 머지 리퀘스트"
          value={fmtInt(mergeRequests.length)}
          unit="건"
          hint={`리뷰 대기 ${needsReview} · 승인됨 ${approvedMRs.length} · 초안 ${draftMRs.length}`}
          icon={GitPullRequestIcon}
          tone="orange"
          spark={weeklyThroughput.map((w) => w.opened)}
        />
        <KpiTile
          label="이번 주 머지"
          value={fmtInt(mergedThisWeek)}
          unit="건"
          hint={`지난주 ${mergedLastWeek}건 · 토요일 오전 기준`}
          trend={trendOf(mergedThisWeek, mergedLastWeek)}
          icon={GitMergeIcon}
          tone="emerald"
          spark={weeklyThroughput.map((w) => w.merged)}
        />
        <KpiTile
          label="머지 소요 시간 (중앙값)"
          value={fmtHours(medianTimeToMergeHours)}
          hint={`p90 ${fmtHours(timeToMerge[11].p90)}`}
          trend={trendOf(medianTimeToMergeHours, timeToMerge[10].p50, { invert: true, digits: 1, suffix: "h" })}
          icon={TimerIcon}
          tone="sky"
          spark={timeToMerge.map((t) => t.p50)}
        />
        <KpiTile
          label="첫 리뷰까지"
          value={fmtHours(firstReviewHours)}
          hint={`10일 이상 열린 MR ${staleMRs.length}건`}
          icon={HourglassIcon}
          tone="violet"
        />
      </KpiGrid>

      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @4xl/main:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>주간 처리량</CardTitle>
            <CardDescription>열림 / 머지 / 닫힘 · 최근 12주</CardDescription>
          </CardHeader>
          <CardContent>
            <TimeBarChart
              data={weeklyThroughput.map((w) => ({ week: w.weekStart, opened: w.opened, merged: w.merged, closed: w.closed }))}
              xKey="week"
              series={[
                { key: "opened", label: "열림", color: "var(--chart-1)" },
                { key: "merged", label: "머지", color: "var(--chart-2)" },
                { key: "closed", label: "닫힘", color: "var(--chart-3)" },
              ]}
              xFormatter={fmtDateShort}
              labelFormatter={fmtWeekRange}
              valueFormatter={fmtInt}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>머지까지 걸린 시간</CardTitle>
            <CardDescription>열림 → 머지 · 주별 중앙값과 p90 (시간)</CardDescription>
          </CardHeader>
          <CardContent>
            <TimeLineChart
              data={timeToMerge.map((t) => ({ week: t.weekStart, p50: t.p50, p90: t.p90 }))}
              xKey="week"
              series={[
                { key: "p50", label: "중앙값", color: "var(--chart-1)" },
                { key: "p90", label: "p90", color: "var(--chart-2)" },
              ]}
              xFormatter={fmtDateShort}
              labelFormatter={fmtWeekRange}
              valueFormatter={(v) => `${v.toFixed(0)}h`}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @6xl/main:grid-cols-3">
        <Card className="@6xl/main:col-span-2">
          <CardHeader>
            <CardTitle>열린 머지 리퀘스트</CardTitle>
            <CardDescription>최근 업데이트 순</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
              <TabsList className="h-auto flex-wrap">
                {FILTERS.map((f) => (
                  <TabsTrigger key={f.value} value={f.value}>
                    {f.label}
                    <Badge variant="secondary" className="px-1.5 tabular-nums">
                      {count(f.value)}
                    </Badge>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader className="bg-muted/60">
                  <TableRow>
                    <TableHead className="min-w-72">머지 리퀘스트</TableHead>
                    <TableHead>작성자</TableHead>
                    <TableHead className="hidden xl:table-cell">리뷰어</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead className="hidden md:table-cell">파이프라인</TableHead>
                    <TableHead className="hidden text-right lg:table-cell">변경</TableHead>
                    <TableHead className="hidden text-center md:table-cell">승인</TableHead>
                    <TableHead className="text-right">생성</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                        해당하는 머지 리퀘스트가 없습니다.
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((mr) => <MRRow key={mr.iid} mr={mr} />)
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>리뷰어 부하</CardTitle>
              <CardDescription>대기 중인 리뷰 수 · 30일 완료</CardDescription>
            </CardHeader>
            <CardContent>
              <BarList
                color="var(--chart-2)"
                items={reviewerLoad.map((r) => ({
                  key: String(r.user.id),
                  label: (
                    <span className="inline-flex items-center gap-2">
                      <UserAvatar name={r.user.name} hue={r.user.hue} size="xs" />
                      {r.user.name}
                    </span>
                  ),
                  value: r.pending,
                  display: `${r.pending}건`,
                  secondary: `30일 ${r.done30d}건 완료`,
                }))}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>오래된 머지 리퀘스트</CardTitle>
              <CardDescription>10일 이상 열려 있음</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {staleMRs.slice(0, 5).map((mr) => (
                <div key={mr.iid} className="flex items-center gap-2 text-sm">
                  <span className="shrink-0 rounded bg-amber-500/14 px-1.5 py-px text-[11px] font-bold text-amber-800 tabular-nums dark:text-amber-300">
                    {Math.floor(mrAgeHours(mr) / 24)}일
                  </span>
                  <span className="min-w-0 flex-1 truncate">{mr.title}</span>
                  <span className="shrink-0 font-mono text-xs text-muted-foreground">!{mr.iid}</span>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>라벨 분포</CardTitle>
              <CardDescription>열린 MR 기준</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-1.5">
              {labelCounts.map((l) => (
                <span key={l.label} className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${LABEL_CLASS[l.label]}`}>
                  {l.label}
                  <span className="tabular-nums opacity-80">{l.count}</span>
                </span>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
