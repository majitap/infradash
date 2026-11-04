"use client"

import * as React from "react"
import {
  BugIcon,
  CircleAlertIcon,
  CircleCheckIcon,
  CircleXIcon,
  EyeOffIcon,
  KeyRoundIcon,
  SearchIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  TimerIcon,
  WrenchIcon,
  type LucideIcon,
} from "lucide-react"

import { TimeBarChart } from "@/components/charts/time-bar-chart"
import { BarList } from "@/components/dashboard/bar-list"
import { KpiGrid, KpiTile } from "@/components/dashboard/kpi-tile"
import { ProjectRef } from "@/components/dashboard/project-ref"
import { Section } from "@/components/dashboard/section-header"
import { StatusPill } from "@/components/dashboard/status-pill"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fmtDate, fmtDateShort, fmtInt, fmtWeekRange } from "@/lib/format"
import {
  SEVERITY_LABELS,
  byScanner,
  complianceChecks,
  fixableCount,
  mttrDays,
  openVulnerabilities,
  projectRisk,
  secretLeaks30d,
  severityTotals,
  vulnerabilities,
  weeklySeverity,
  type Severity,
  type VulnStatus,
} from "@/lib/mock-data"
import type { Status } from "@/lib/tones"
import { cn } from "@/lib/utils"

const SEVERITY_STATUS: Record<Severity, Status> = { critical: "critical", high: "serious", medium: "warning", low: "neutral" }
const SEVERITY_COLOR: Record<Severity, string> = {
  critical: "var(--status-critical)",
  high: "var(--status-serious)",
  medium: "var(--status-warning)",
  low: "var(--chart-1)",
}

const VULN_STATUS: Record<VulnStatus, { status: Status; label: string; icon: LucideIcon }> = {
  detected: { status: "info", label: "탐지됨", icon: CircleAlertIcon },
  confirmed: { status: "critical", label: "확인됨", icon: ShieldAlertIcon },
  dismissed: { status: "neutral", label: "무시됨", icon: EyeOffIcon },
  resolved: { status: "good", label: "해결됨", icon: CircleCheckIcon },
}

type Filter = "all" | Severity

export function SecurityView() {
  const [filter, setFilter] = React.useState<Filter>("all")
  const [query, setQuery] = React.useState("")
  const q = query.trim().toLowerCase()

  const rows = vulnerabilities
    .filter((v) => filter === "all" || v.severity === filter)
    .filter((v) => !q || `${v.title} ${v.id} ${v.cve ?? ""} ${v.project} ${v.scanner} ${v.location}`.toLowerCase().includes(q))
    .sort((a, b) => {
      const order: Severity[] = ["critical", "high", "medium", "low"]
      return order.indexOf(a.severity) - order.indexOf(b.severity) || b.detectedAt.localeCompare(a.detectedAt)
    })

  const critical = severityTotals.find((s) => s.severity === "critical")?.count ?? 0
  const high = severityTotals.find((s) => s.severity === "high")?.count ?? 0
  const passed = complianceChecks.filter((c) => c.passed).length

  return (
    <>
      {secretLeaks30d > 0 && (
        <Section>
          <div className="flex flex-wrap items-center gap-3.5 rounded-[20px] bg-[#FF3B30]/[0.07] px-5 py-3.5 ring-1 ring-[#FF3B30]/25 dark:bg-[#FF453A]/12 dark:ring-[#FF453A]/30">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-[11px] bg-[#FF3B30]/15 text-[#FF3B30] dark:text-[#FF6961]">
              <KeyRoundIcon className="size-4.5 stroke-[2.2]" />
            </span>
            <div className="min-w-0 flex-1 leading-snug">
              <div className="text-[14px] font-bold tracking-[-0.015em] text-foreground">
                시크릿 키 노출 {secretLeaks30d}건이 아직 폐기되지 않았습니다
              </div>
              <div className="text-[12.5px] text-muted-foreground">
                <code className="font-mono font-semibold text-foreground/90">etl-pipelines</code> 저장소에서 탐지된 AWS 액세스 키를 즉시 교체(Rotate)하고 Git 히스토리에서 영구 삭제하세요.
              </div>
            </div>
            <StatusPill status="critical" label="즉시 폐기 권고" size="sm" />
          </div>
        </Section>
      )}

      <KpiGrid>
        <KpiTile
          label="열린 취약점"
          value={fmtInt(openVulnerabilities)}
          unit="건"
          hint={severityTotals.map((s) => `${s.label} ${s.count}`).join(" · ")}
          icon={BugIcon}
          tone="rose"
          spark={weeklySeverity.map((w) => w.critical + w.high + w.medium + w.low)}
        />
        <KpiTile
          label="치명 + 높음 등급"
          value={fmtInt(critical + high)}
          unit="건"
          hint={`30일 내 시크릿 노출 ${secretLeaks30d}건`}
          icon={ShieldAlertIcon}
          tone={critical > 0 ? "rose" : "amber"}
          spark={weeklySeverity.map((w) => w.critical + w.high)}
        />
        <KpiTile
          label="패치 즉시 가능"
          value={fmtInt(fixableCount)}
          unit="건"
          hint="의존성 버전 업그레이드로 해결"
          icon={WrenchIcon}
          tone="emerald"
        />
        <KpiTile
          label="평균 취약점 해결"
          value={mttrDays.toFixed(1)}
          unit="일"
          hint={`컴플라이언스 ${passed}/${complianceChecks.length} 통과`}
          icon={TimerIcon}
          tone="sky"
        />
      </KpiGrid>

      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @5xl/main:grid-cols-12">
        <Card className="@5xl/main:col-span-8">
          <CardHeader>
            <CardTitle>심각도별 취약점 추이</CardTitle>
            <CardDescription>주별 미해결 취약점 누적 분포 · 최근 12주</CardDescription>
          </CardHeader>
          <CardContent>
            <TimeBarChart
              data={weeklySeverity.map((w) => ({ week: w.weekStart, low: w.low, medium: w.medium, high: w.high, critical: w.critical }))}
              xKey="week"
              series={[
                { key: "low", label: "낮음", color: SEVERITY_COLOR.low },
                { key: "medium", label: "중간", color: SEVERITY_COLOR.medium },
                { key: "high", label: "높음", color: SEVERITY_COLOR.high },
                { key: "critical", label: "치명", color: SEVERITY_COLOR.critical },
              ]}
              stacked
              xFormatter={fmtDateShort}
              labelFormatter={fmtWeekRange}
              valueFormatter={fmtInt}
              className="h-64"
            />
          </CardContent>
        </Card>

        <Card className="@5xl/main:col-span-4">
          <CardHeader>
            <CardTitle>보안 스캐너별 탐지</CardTitle>
            <CardDescription>GitLab Ultimate 보안 스캐너 기준</CardDescription>
          </CardHeader>
          <CardContent>
            <BarList color="var(--chart-1)" items={byScanner.map((s) => ({ key: s.scanner, label: s.scanner, value: s.count }))} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @6xl/main:grid-cols-12">
        <Card className="@6xl/main:col-span-8">
          <CardHeader>
            <CardTitle>취약점 목록</CardTitle>
            <CardDescription>심각도 우선 정렬 · {rows.length}건 표시</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
                <TabsList className="h-auto flex-wrap">
                  <TabsTrigger value="all">
                    전체
                    <Badge variant="secondary" className="px-1.5 tabular-nums">
                      {vulnerabilities.length}
                    </Badge>
                  </TabsTrigger>
                  {(["critical", "high", "medium", "low"] as Severity[]).map((s) => (
                    <TabsTrigger key={s} value={s}>
                      <span className="size-2 rounded-full" style={{ background: SEVERITY_COLOR[s] }} />
                      {SEVERITY_LABELS[s]}
                      <Badge variant="secondary" className="px-1.5 tabular-nums">
                        {vulnerabilities.filter((v) => v.severity === s).length}
                      </Badge>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              <div className="relative sm:w-64">
                <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="CVE, 제목, 프로젝트, 위치 검색"
                  className="pl-9"
                  aria-label="취약점 검색"
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-black/[0.055] dark:border-white/[0.065]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-72">취약점</TableHead>
                    <TableHead>심각도</TableHead>
                    <TableHead className="hidden md:table-cell">스캐너</TableHead>
                    <TableHead className="hidden lg:table-cell">저장소</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead className="hidden text-right xl:table-cell">탐지일</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((v) => {
                    const st = VULN_STATUS[v.status]
                    return (
                      <TableRow key={v.id} className={v.status === "resolved" || v.status === "dismissed" ? "opacity-60" : undefined}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="truncate font-semibold text-foreground">{v.title}</span>
                            {v.fixAvailable && (
                              <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-tone-emerald/12 px-2 py-0.5 text-[10.5px] font-semibold text-tone-emerald">
                                <WrenchIcon className="size-2.5" />
                                패치 가능
                              </span>
                            )}
                          </div>
                          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 font-mono text-xs text-muted-foreground">
                            <span>{v.id}</span>
                            {v.cve && <span className="rounded bg-black/[0.05] px-1.5 py-px dark:bg-white/[0.07]">{v.cve}</span>}
                            <span className="truncate">{v.location}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusPill status={SEVERITY_STATUS[v.severity]} label={SEVERITY_LABELS[v.severity]} size="xs" />
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className="rounded-md bg-black/[0.045] px-2 py-0.5 text-[11px] font-semibold dark:bg-white/[0.07]">
                            {v.scanner}
                          </span>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <ProjectRef name={v.project} showGroup={false} />
                        </TableCell>
                        <TableCell>
                          <StatusPill status={st.status} label={st.label} icon={st.icon} size="xs" />
                        </TableCell>
                        <TableCell className="hidden text-right text-xs text-muted-foreground whitespace-nowrap xl:table-cell">
                          {fmtDate(v.detectedAt)}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4 @6xl/main:col-span-4">
          <Card>
            <CardHeader>
              <CardTitle>컴플라이언스 체크리스트</CardTitle>
              <CardDescription>
                {passed} / {complianceChecks.length} 보안 통제 항목 충족
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="h-1.5 overflow-hidden rounded-full bg-black/[0.06] dark:bg-white/[0.08]">
                <div
                  className="h-full rounded-full bg-status-good"
                  style={{ width: `${(passed / complianceChecks.length) * 100}%` }}
                />
              </div>
              <div className="flex flex-col gap-1">
                {complianceChecks.map((c) => (
                  <div key={c.id} className="flex items-start gap-2.5 rounded-xl px-2.5 py-2 hover:bg-black/[0.025] dark:hover:bg-white/[0.03]">
                    {c.passed ? (
                      <ShieldCheckIcon className="mt-0.5 size-4 shrink-0 text-tone-emerald" />
                    ) : (
                      <CircleXIcon className="mt-0.5 size-4 shrink-0 text-tone-rose" />
                    )}
                    <div className="min-w-0 leading-snug">
                      <div className={cn("text-[13.5px] font-semibold", !c.passed ? "text-tone-rose" : "text-foreground")}>{c.label}</div>
                      <div className="text-xs text-muted-foreground">{c.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>저장소 위험도 지수</CardTitle>
              <CardDescription>치명 ×10, 높음 ×4, 중간 ×1 가중 스코어</CardDescription>
            </CardHeader>
            <CardContent>
              <BarList
                color="var(--status-serious)"
                items={projectRisk.map((p) => ({
                  key: p.project,
                  label: <span className="font-mono text-[12.5px]">{p.project}</span>,
                  value: p.score,
                  display: p.score.toFixed(0),
                  secondary: `치명 ${p.critical} · 높음 ${p.high}`,
                }))}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
