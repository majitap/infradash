"use client"

import * as React from "react"
import {
  ArchiveIcon,
  CircleCheckIcon,
  CircleDotIcon,
  CircleXIcon,
  FolderGit2Icon,
  GitCommitHorizontalIcon,
  GitPullRequestIcon,
  GlobeIcon,
  LayoutGridIcon,
  ListIcon,
  LockIcon,
  SearchIcon,
  StarIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react"

import { BarList } from "@/components/dashboard/bar-list"
import { DonutChart } from "@/components/dashboard/donut-chart"
import { KpiGrid, KpiTile } from "@/components/dashboard/kpi-tile"
import { LanguageDot } from "@/components/dashboard/project-ref"
import { Sparkline } from "@/components/dashboard/sparkline"
import { StatusPill } from "@/components/dashboard/status-pill"
import { UserAvatar } from "@/components/dashboard/user-avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fmtInt, fmtPct, fmtSize, relativeTime } from "@/lib/format"
import { LANGUAGE_COLORS } from "@/lib/languages"
import {
  activeProjects,
  groupCounts,
  languageDistribution,
  projects,
  totalStorage,
  userById,
  type MockProject,
  type Visibility,
} from "@/lib/mock-data"
import type { Status } from "@/lib/tones"
import { cn } from "@/lib/utils"

const VISIBILITY: Record<Visibility, { label: string; icon: LucideIcon }> = {
  private: { label: "비공개", icon: LockIcon },
  internal: { label: "내부", icon: UsersIcon },
  public: { label: "공개", icon: GlobeIcon },
}

const CHART_SLOTS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "var(--chart-6)"]

type Filter = "all" | Visibility | "archived"

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "private", label: "비공개" },
  { value: "internal", label: "내부" },
  { value: "public", label: "공개" },
  { value: "archived", label: "아카이브" },
]

function pipelineStatus(rate: number): { status: Status; icon: LucideIcon } {
  if (rate >= 95) return { status: "good", icon: CircleCheckIcon }
  if (rate >= 88) return { status: "warning", icon: CircleDotIcon }
  return { status: "critical", icon: CircleXIcon }
}

function matches(p: MockProject, filter: Filter) {
  if (filter === "all") return true
  if (filter === "archived") return p.archived
  return !p.archived && p.visibility === filter
}

export function ProjectsView() {
  const [filter, setFilter] = React.useState<Filter>("all")
  const [query, setQuery] = React.useState("")
  const [viewMode, setViewMode] = React.useState<"grid" | "table">("grid")

  const q = query.trim().toLowerCase()
  const rows = projects
    .filter((p) => matches(p, filter))
    .filter((p) => !q || `${p.path} ${p.description} ${p.language} ${p.topics.join(" ")}`.toLowerCase().includes(q))
    .sort((a, b) => Number(a.archived) - Number(b.archived) || b.commits30d - a.commits30d)

  const commits30d = activeProjects.reduce((s, p) => s + p.commits30d, 0)
  const openMRs = activeProjects.reduce((s, p) => s + p.openMRs, 0)
  const openIssues = activeProjects.reduce((s, p) => s + p.openIssues, 0)
  const mostActive = [...activeProjects].sort((a, b) => b.commits30d - a.commits30d).slice(0, 5)

  return (
    <>
      <KpiGrid>
        <KpiTile
          label="활성 프로젝트"
          value={fmtInt(activeProjects.length)}
          unit="개"
          hint={`아카이브 ${projects.length - activeProjects.length}개 · 그룹 ${groupCounts.length}개`}
          icon={FolderGit2Icon}
          tone="emerald"
        />
        <KpiTile
          label="30일 커밋 합계"
          value={fmtInt(commits30d)}
          unit="개"
          hint="활성 프로젝트 기준"
          icon={GitCommitHorizontalIcon}
          tone="violet"
          spark={Array.from({ length: 12 }, (_, w) => activeProjects.reduce((s, p) => s + p.weeklyCommits[w], 0))}
        />
        <KpiTile label="열린 MR" value={fmtInt(openMRs)} unit="건" hint="전체 저장소 합산" icon={GitPullRequestIcon} tone="orange" />
        <KpiTile
          label="열린 이슈"
          value={fmtInt(openIssues)}
          unit="건"
          hint={`프로젝트당 평균 ${(openIssues / activeProjects.length).toFixed(1)}건`}
          icon={CircleDotIcon}
          tone="sky"
        />
      </KpiGrid>

      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @3xl/main:grid-cols-2 @6xl/main:grid-cols-12">
        <Card className="@6xl/main:col-span-4">
          <CardHeader>
            <CardTitle>주 언어 분포</CardTitle>
            <CardDescription>전체 {projects.length}개 저장소 기준</CardDescription>
          </CardHeader>
          <CardContent>
            <DonutChart
              data={languageDistribution.map((l, i) => ({ key: l.label, label: l.label, value: l.count, color: CHART_SLOTS[i] }))}
              centerValue={String(projects.length)}
              centerLabel="프로젝트"
            />
          </CardContent>
        </Card>

        <Card className="@6xl/main:col-span-4">
          <CardHeader>
            <CardTitle>네임스페이스 그룹 분포</CardTitle>
            <CardDescription>최상위 조직 그룹 기준</CardDescription>
          </CardHeader>
          <CardContent>
            <BarList
              color="var(--chart-3)"
              items={groupCounts.map((g) => ({
                key: g.group,
                label: <span className="font-mono text-[12.5px]">{g.group}</span>,
                value: g.count,
                display: `${g.count}개`,
              }))}
            />
          </CardContent>
        </Card>

        <Card className="@3xl/main:col-span-2 @6xl/main:col-span-4">
          <CardHeader>
            <CardTitle>가장 활발한 저장소</CardTitle>
            <CardDescription>최근 30일 커밋 및 12주 활동 곡선</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col divide-y divide-black/[0.045] dark:divide-white/[0.055]">
              {mostActive.map((p) => (
                <li key={p.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                  <span className="size-2.5 shrink-0 rounded-full" style={{ background: LANGUAGE_COLORS[p.language] }} />
                  <div className="min-w-0 flex-1 leading-tight">
                    <div className="truncate font-mono text-[13px] font-semibold text-foreground">{p.name}</div>
                    <div className="truncate text-xs text-muted-foreground">{p.group}</div>
                  </div>
                  <Sparkline data={p.weeklyCommits} color="var(--chart-3)" className="h-7 w-20" />
                  <span className="w-12 text-right font-bold text-foreground tabular-nums">{fmtInt(p.commits30d)}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle>프로젝트 카탈로그</CardTitle>
            <CardDescription>{rows.length}개 저장소 표시 · 30일 활동 순</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
                <TabsList className="h-auto flex-wrap">
                  {FILTERS.map((f) => (
                    <TabsTrigger key={f.value} value={f.value}>
                      {f.label}
                      <Badge variant="secondary" className="px-1.5 tabular-nums">
                        {projects.filter((p) => matches(p, f.value)).length}
                      </Badge>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>

              <div className="flex items-center gap-2">
                <div className="relative flex-1 sm:w-68">
                  <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="이름, 설명, 언어, 토픽 검색"
                    className="pl-9"
                    aria-label="프로젝트 검색"
                  />
                </div>
                <div className="inline-flex shrink-0 items-center rounded-[10px] bg-black/[0.05] p-[3px] dark:bg-white/[0.07]">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    aria-label="카드 뷰"
                    className={cn(
                      "inline-flex items-center gap-1 rounded-[7.5px] px-2.5 py-1 text-xs font-medium transition-all",
                      viewMode === "grid"
                        ? "bg-white font-semibold text-foreground shadow-2xs dark:bg-white/[0.14] dark:text-white"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <LayoutGridIcon className="size-3.5" />
                    <span className="hidden sm:inline">카드</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("table")}
                    aria-label="테이블 뷰"
                    className={cn(
                      "inline-flex items-center gap-1 rounded-[7.5px] px-2.5 py-1 text-xs font-medium transition-all",
                      viewMode === "table"
                        ? "bg-white font-semibold text-foreground shadow-2xs dark:bg-white/[0.14] dark:text-white"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <ListIcon className="size-3.5" />
                    <span className="hidden sm:inline">목록</span>
                  </button>
                </div>
              </div>
            </div>

            {rows.length === 0 ? (
              <div className="py-16 text-center text-sm text-muted-foreground">검색 결과가 없습니다.</div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 gap-3.5 @2xl/main:grid-cols-2 @6xl/main:grid-cols-3">
                {rows.map((p) => {
                  const vis = VISIBILITY[p.visibility]
                  const ps = pipelineStatus(p.pipelineSuccess30d)
                  return (
                    <div
                      key={p.id}
                      className={cn(
                        "flex flex-col justify-between gap-3.5 rounded-2xl bg-black/[0.018] p-4 ring-1 ring-black/[0.055] transition-all duration-150 hover:bg-black/[0.032] dark:bg-white/[0.025] dark:ring-white/[0.065] dark:hover:bg-white/[0.045]",
                        p.archived && "opacity-60"
                      )}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="truncate font-mono text-[11.5px] text-muted-foreground">{p.group}</div>
                            <div className="mt-0.5 flex items-center gap-1.5">
                              <span className="truncate font-mono text-[14.5px] font-bold tracking-[-0.015em] text-foreground">{p.name}</span>
                              {p.visibility === "public" && (
                                <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-tone-amber">
                                  <StarIcon className="size-3 fill-current" />
                                  {p.stars}
                                </span>
                              )}
                            </div>
                          </div>
                          {p.archived ? (
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-black/[0.06] px-2 py-0.5 text-[10.5px] font-semibold text-muted-foreground dark:bg-white/[0.08]">
                              <ArchiveIcon className="size-3" />
                              아카이브
                            </span>
                          ) : (
                            <StatusPill status={ps.status} label={fmtPct(p.pipelineSuccess30d, 1)} icon={ps.icon} size="xs" />
                          )}
                        </div>
                        <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-relaxed text-muted-foreground">{p.description}</p>
                      </div>

                      <div className="flex items-end justify-between gap-3 border-t border-black/[0.045] pt-3 dark:border-white/[0.055]">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                            <LanguageDot language={p.language} />
                            <span className="inline-flex items-center gap-1">
                              <vis.icon className="size-3" />
                              {vis.label}
                            </span>
                            <span className="tabular-nums">{fmtSize(totalStorage(p))}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[11.5px] text-muted-foreground">
                            <span>
                              30일 커밋 <b className="font-semibold text-foreground tabular-nums">{fmtInt(p.commits30d)}</b>
                            </span>
                            <span>·</span>
                            <span>MR {p.openMRs}</span>
                            <span>·</span>
                            <span>{relativeTime(p.lastActivityAt)}</span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1.5">
                          <Sparkline data={p.weeklyCommits} color={LANGUAGE_COLORS[p.language]} className="h-7 w-20" />
                          <div className="flex -space-x-1.5">
                            {p.maintainerIds.map((id) => {
                              const u = userById(id)
                              return <UserAvatar key={id} name={u.name} hue={u.hue} size="xs" className="size-5 text-[9.5px] ring-2 ring-card" />
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-black/[0.055] dark:border-white/[0.065]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-64">프로젝트</TableHead>
                      <TableHead>언어</TableHead>
                      <TableHead className="hidden md:table-cell">가시성</TableHead>
                      <TableHead className="hidden lg:table-cell">활동 (12주)</TableHead>
                      <TableHead className="text-right">30일 커밋</TableHead>
                      <TableHead className="hidden text-right md:table-cell">MR / 이슈</TableHead>
                      <TableHead className="hidden xl:table-cell">파이프라인</TableHead>
                      <TableHead className="hidden text-right xl:table-cell">스토리지</TableHead>
                      <TableHead className="hidden 2xl:table-cell">관리자</TableHead>
                      <TableHead className="text-right">최근 활동</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((p) => {
                      const vis = VISIBILITY[p.visibility]
                      const ps = pipelineStatus(p.pipelineSuccess30d)
                      return (
                        <TableRow key={p.id} className={p.archived ? "opacity-60" : undefined}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[13px]">
                                <span className="text-muted-foreground">{p.group}/</span>
                                <span className="font-semibold text-foreground">{p.name}</span>
                              </span>
                              {p.archived && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-black/[0.06] px-2 py-0.5 text-[10.5px] font-semibold text-muted-foreground dark:bg-white/[0.08]">
                                  <ArchiveIcon className="size-3" />
                                  아카이브
                                </span>
                              )}
                              {p.visibility === "public" && (
                                <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-tone-amber">
                                  <StarIcon className="size-3 fill-current" />
                                  {p.stars}
                                </span>
                              )}
                            </div>
                            <div className="mt-0.5 truncate text-xs text-muted-foreground">{p.description}</div>
                          </TableCell>
                          <TableCell>
                            <LanguageDot language={p.language} />
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                              <vis.icon className="size-3.5" />
                              {vis.label}
                            </span>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <Sparkline data={p.weeklyCommits} color="var(--chart-3)" className="h-6 w-24" />
                          </TableCell>
                          <TableCell className="text-right font-bold tabular-nums">{fmtInt(p.commits30d)}</TableCell>
                          <TableCell className="hidden text-right tabular-nums md:table-cell">
                            {p.openMRs} / {p.openIssues}
                          </TableCell>
                          <TableCell className="hidden xl:table-cell">
                            {p.archived ? (
                              <span className="text-xs text-muted-foreground">—</span>
                            ) : (
                              <StatusPill status={ps.status} label={fmtPct(p.pipelineSuccess30d, 1)} icon={ps.icon} size="xs" />
                            )}
                          </TableCell>
                          <TableCell className="hidden text-right text-sm tabular-nums xl:table-cell">{fmtSize(totalStorage(p))}</TableCell>
                          <TableCell className="hidden 2xl:table-cell">
                            <div className="flex -space-x-1.5">
                              {p.maintainerIds.map((id) => {
                                const u = userById(id)
                                return <UserAvatar key={id} name={u.name} hue={u.hue} size="xs" className="ring-2 ring-card" />
                              })}
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-xs text-muted-foreground whitespace-nowrap">{relativeTime(p.lastActivityAt)}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
