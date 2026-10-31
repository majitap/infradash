"use client"

import * as React from "react"
import {
  BugIcon,
  CircleAlertIcon,
  CircleCheckIcon,
  CircleXIcon,
  EyeOffIcon,
  KeyRoundIcon,
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
import { StatusPill } from "@/components/dashboard/status-pill"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  low: "oklch(0.72 0.02 260)",
}

const VULN_STATUS: Record<VulnStatus, { status: Status; label: string; icon: LucideIcon }> = {
  detected: { status: "info", label: "탐지됨", icon: CircleAlertIcon },
  confirmed: { status: "critical", label: "확인됨", icon: ShieldAlertIcon },
  dismissed: { status: "neutral", label: "무시", icon: EyeOffIcon },
  resolved: { status: "good", label: "해결", icon: CircleCheckIcon },
}

type Filter = "all" | Severity

export function SecurityView() {
  const [filter, setFilter] = React.useState<Filter>("all")
  const rows = (filter === "all" ? vulnerabilities : vulnerabilities.filter((v) => v.severity === filter)).sort((a, b) => {
    const order: Severity[] = ["critical", "high", "medium", "low"]
    return order.indexOf(a.severity) - order.indexOf(b.severity) || b.detectedAt.localeCompare(a.detectedAt)
  })
  const critical = severityTotals.find((s) => s.severity === "critical")?.count ?? 0
  const high = severityTotals.find((s) => s.severity === "high")?.count ?? 0
  const passed = complianceChecks.filter((c) => c.passed).length

  return (
    <>
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
          label="치명 + 높음"
          value={fmtInt(critical + high)}
          unit="건"
          hint={`시크릿 노출 ${secretLeaks30d}건 (30일)`}
          icon={ShieldAlertIcon}
          tone={critical > 0 ? "rose" : "amber"}
          spark={weeklySeverity.map((w) => w.critical + w.high)}
        />
        <KpiTile label="패치로 해결 가능" value={fmtInt(fixableCount)} unit="건" hint="의존성 업그레이드로 해결" icon={WrenchIcon} tone="emerald" />
        <KpiTile label="평균 해결 기간" value={mttrDays.toFixed(1)} unit="일" hint={`컴플라이언스 ${passed}/${complianceChecks.length} 통과`} icon={TimerIcon} tone="sky" />
      </KpiGrid>

      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @5xl/main:grid-cols-3">
        <Card className="@5xl/main:col-span-2">
          <CardHeader>
            <CardTitle>심각도별 추이</CardTitle>
            <CardDescription>주별 열린 취약점 · 최근 12주</CardDescription>
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
        <Card>
          <CardHeader>
            <CardTitle>스캐너별 탐지</CardTitle>
            <CardDescription>열린 취약점 기준</CardDescription>
          </CardHeader>
          <CardContent>
            <BarList color="var(--chart-1)" items={byScanner.map((s) => ({ key: s.scanner, label: s.scanner, value: s.count }))} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @6xl/main:grid-cols-3">
        <Card className="@6xl/main:col-span-2">
          <CardHeader>
            <CardTitle>취약점</CardTitle>
            <CardDescription>심각도 순 · {rows.length}건 표시</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
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
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader className="bg-muted/60">
                  <TableRow>
                    <TableHead className="min-w-72">취약점</TableHead>
                    <TableHead>심각도</TableHead>
                    <TableHead className="hidden md:table-cell">스캐너</TableHead>
                    <TableHead className="hidden lg:table-cell">프로젝트</TableHead>
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
                            <span className="truncate font-medium">{v.title}</span>
                            {v.fixAvailable && (
                              <span className="inline-flex shrink-0 items-center gap-0.5 rounded bg-emerald-500/12 px-1.5 py-px text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                                <WrenchIcon className="size-3" />
                                패치
                              </span>
                            )}
                          </div>
                          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 font-mono text-xs text-muted-foreground">
                            <span>{v.id}</span>
                            {v.cve && <span className="rounded bg-muted px-1">{v.cve}</span>}
                            <span className="truncate">{v.location}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusPill status={SEVERITY_STATUS[v.severity]} label={SEVERITY_LABELS[v.severity]} size="xs" />
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className="rounded bg-muted px-1.5 py-px text-[11px] font-bold">{v.scanner}</span>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <ProjectRef name={v.project} showGroup={false} />
                        </TableCell>
                        <TableCell>
                          <StatusPill status={st.status} label={st.label} icon={st.icon} size="xs" />
                        </TableCell>
                        <TableCell className="hidden text-right text-xs text-muted-foreground whitespace-nowrap xl:table-cell">{fmtDate(v.detectedAt)}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>컴플라이언스 점검</CardTitle>
              <CardDescription>
                {passed} / {complianceChecks.length} 항목 통과
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-1.5">
              {complianceChecks.map((c) => (
                <div key={c.id} className="flex items-start gap-2.5 rounded-lg px-2 py-1.5 hover:bg-muted/50">
                  {c.passed ? (
                    <ShieldCheckIcon className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-300" />
                  ) : (
                    <CircleXIcon className="mt-0.5 size-4 shrink-0 text-rose-600 dark:text-rose-300" />
                  )}
                  <div className="min-w-0 leading-tight">
                    <div className={cn("text-sm font-bold", !c.passed && "text-rose-700 dark:text-rose-300")}>{c.label}</div>
                    <div className="text-xs text-muted-foreground">{c.detail}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>프로젝트 위험도</CardTitle>
              <CardDescription>치명 ×10, 높음 ×4, 중간 ×1 가중치</CardDescription>
            </CardHeader>
            <CardContent>
              <BarList
                color="var(--status-serious)"
                items={projectRisk.map((p) => ({
                  key: p.project,
                  label: <span className="font-mono">{p.project}</span>,
                  value: p.score,
                  display: p.score.toFixed(0),
                  secondary: `치명 ${p.critical} · 높음 ${p.high} · 중간 ${p.medium}`,
                }))}
              />
            </CardContent>
          </Card>
          <Card size="sm" className="border-rose-500/30 bg-rose-500/5">
            <CardContent className="flex items-start gap-3 text-sm">
              <KeyRoundIcon className="mt-0.5 size-4 shrink-0 text-rose-600 dark:text-rose-300" />
              <div>
                <div className="font-bold">시크릿 노출 {secretLeaks30d}건이 아직 폐기되지 않았습니다</div>
                <div className="text-xs text-muted-foreground">etl-pipelines의 AWS 액세스 키를 즉시 교체하고 히스토리에서 제거하세요.</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
