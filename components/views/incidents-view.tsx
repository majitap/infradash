"use client"

import * as React from "react"
import {
  CircleCheckIcon,
  HeartPulseIcon,
  HistoryIcon,
  PhoneCallIcon,
  SirenIcon,
  TimerIcon,
  TriangleAlertIcon,
  WrenchIcon,
  type LucideIcon,
} from "lucide-react"

import { TimeBarChart } from "@/components/charts/time-bar-chart"
import { KpiGrid, KpiTile } from "@/components/dashboard/kpi-tile"
import { Section } from "@/components/dashboard/section-header"
import { StatusPill } from "@/components/dashboard/status-pill"
import { trendOf } from "@/components/dashboard/trend-badge"
import { UserAvatar, UserCell } from "@/components/dashboard/user-avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fmtDateTime, fmtInt, fmtMinutes, fmtMonth, fmtPct } from "@/lib/format"
import {
  SEVERITY_DESC,
  incidents,
  monthlyIncidentStats,
  mttrLastMonth,
  mttrThisMonth,
  onCall,
  openIncidents,
  serviceUptime,
  severityCounts90d,
  type IncidentSeverity,
  type IncidentStatus,
} from "@/lib/mock-data"
import type { Status } from "@/lib/tones"
import { cn } from "@/lib/utils"

const SEV_CLASS: Record<IncidentSeverity, string> = {
  S1: "bg-status-critical text-white",
  S2: "bg-status-serious text-white",
  S3: "bg-status-warning text-black",
  S4: "bg-black/[0.06] text-muted-foreground dark:bg-white/[0.1]",
}

const STATUS_META: Record<IncidentStatus, { status: Status; label: string; icon: LucideIcon }> = {
  open: { status: "critical", label: "진행 중", icon: SirenIcon },
  mitigated: { status: "warning", label: "완화됨", icon: WrenchIcon },
  resolved: { status: "good", label: "해결됨", icon: CircleCheckIcon },
}

function uptimeStatus(u: number): Status {
  return u >= 99.9 ? "good" : u >= 99.5 ? "warning" : "critical"
}

export function IncidentsView() {
  const [filter, setFilter] = React.useState<"all" | IncidentStatus>("all")
  const avgUptime = serviceUptime.reduce((s, u) => s + u.uptime, 0) / serviceUptime.length
  const s1 = openIncidents.some((i) => i.severity === "S1")
  const rows = filter === "all" ? incidents : incidents.filter((i) => i.status === filter)

  return (
    <>
      {openIncidents.length > 0 && (
        <Section>
          <div className="grid grid-cols-1 gap-3 @4xl/main:grid-cols-2">
            {openIncidents.map((inc) => (
              <Card key={inc.id} size="sm" className="relative overflow-hidden ring-1 ring-[#FF3B30]/25 dark:ring-[#FF453A]/30">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-16 -right-12 size-48 rounded-full bg-[#FF3B30]/10 blur-2xl"
                />
                <CardContent className="relative flex flex-col gap-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-bold", SEV_CLASS[inc.severity])}>
                        {inc.severity}
                      </span>
                      <span className="font-mono text-xs font-semibold text-muted-foreground">{inc.id}</span>
                      <StatusPill status={STATUS_META[inc.status].status} label={STATUS_META[inc.status].label} icon={STATUS_META[inc.status].icon} size="xs" />
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-tone-rose tabular-nums">
                      <TimerIcon className="size-3.5" />
                      {fmtMinutes(inc.durationMin)} 경과
                    </span>
                  </div>
                  <div className="text-[15px] font-bold tracking-[-0.015em] text-foreground">{inc.title}</div>
                  <div className="text-[12.5px] text-muted-foreground">{inc.impact}</div>
                  <div className="flex items-center justify-between pt-1 text-xs text-muted-foreground">
                    <span className="font-mono">{inc.service}</span>
                    <span className="inline-flex items-center gap-1.5">
                      담당 <UserAvatar name={inc.owner.name} hue={inc.owner.hue} size="xs" className="size-4.5 text-[9px]" />
                      <b className="font-semibold text-foreground">{inc.owner.name}</b>
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </Section>
      )}

      <KpiGrid>
        <KpiTile
          label="진행 중 인시던트"
          value={fmtInt(openIncidents.length)}
          unit="건"
          hint={openIncidents.map((i) => `${i.id} (${i.severity})`).join(" · ") || "없음"}
          icon={SirenIcon}
          tone={s1 ? "rose" : openIncidents.length ? "amber" : "emerald"}
        />
        <KpiTile
          label="이번 달 MTTR"
          value={fmtMinutes(mttrThisMonth)}
          hint={`지난달 ${fmtMinutes(mttrLastMonth)}`}
          trend={trendOf(mttrThisMonth, mttrLastMonth, { invert: true, suffix: "분" })}
          icon={TimerIcon}
          tone="sky"
          spark={monthlyIncidentStats.map((m) => m.mttr)}
        />
        <KpiTile
          label="90일 누적 인시던트"
          value={fmtInt(incidents.length)}
          unit="건"
          hint={severityCounts90d.map((s) => `${s.severity} ${s.count}`).join(" · ")}
          icon={HistoryIcon}
          tone="violet"
          spark={monthlyIncidentStats.map((m) => m.count)}
        />
        <KpiTile
          label="핵심 서비스 가용성"
          value={fmtPct(avgUptime, 2)}
          hint="최근 90일 · 8개 코어 컴포넌트"
          icon={HeartPulseIcon}
          tone={avgUptime >= 99.9 ? "emerald" : "amber"}
        />
      </KpiGrid>

      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @3xl/main:grid-cols-2 @6xl/main:grid-cols-12">
        <Card className="@6xl/main:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PhoneCallIcon className="size-4 text-tone-rose" />
              온콜 대응팀
            </CardTitle>
            <CardDescription>{onCall.rotation}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="apple-inset-well flex items-center gap-3 rounded-2xl px-3.5 py-3">
              <UserAvatar name={onCall.primary.name} hue={onCall.primary.hue} size="lg" />
              <div className="min-w-0 flex-1 leading-snug">
                <div className="text-[11px] font-bold tracking-wide text-tone-rose uppercase">Primary On-Call</div>
                <div className="truncate text-[15px] font-bold text-foreground">{onCall.primary.name}</div>
                <div className="truncate text-xs text-muted-foreground">
                  {onCall.primary.department} · {onCall.primary.title}
                </div>
              </div>
            </div>
            <div className="apple-inset-well flex items-center gap-3 rounded-2xl px-3.5 py-3">
              <UserAvatar name={onCall.secondary.name} hue={onCall.secondary.hue} size="md" />
              <div className="min-w-0 flex-1 leading-snug">
                <div className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">Secondary Escalation</div>
                <div className="truncate font-semibold text-foreground">{onCall.secondary.name}</div>
                <div className="truncate text-xs text-muted-foreground">
                  {onCall.secondary.department} · {onCall.secondary.title}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 pt-0.5">
              {severityCounts90d.map((s) => (
                <div key={s.severity} className="apple-inset-well rounded-2xl px-2 py-2.5 text-center leading-tight">
                  <span className={cn("inline-block rounded-full px-1.5 py-0.5 text-[10.5px] font-bold", SEV_CLASS[s.severity])}>
                    {s.severity}
                  </span>
                  <div className="mt-1.5 text-lg font-bold text-foreground tabular-nums">{s.count}</div>
                  <div className="mt-0.5 text-[10px] text-muted-foreground">{SEVERITY_DESC[s.severity]}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="@6xl/main:col-span-4">
          <CardHeader>
            <CardTitle>월별 평균 복구 시간 (MTTR)</CardTitle>
            <CardDescription>평균 해결 시간 (분) · 최근 6개월</CardDescription>
          </CardHeader>
          <CardContent>
            <TimeBarChart
              data={monthlyIncidentStats.map((m) => ({ month: m.month, mttr: m.mttr }))}
              xKey="month"
              series={[{ key: "mttr", label: "MTTR", color: "var(--chart-1)" }]}
              xFormatter={fmtMonth}
              valueFormatter={(v) => `${v}분`}
              highlightLast
              className="h-52"
            />
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {monthlyIncidentStats.map((m) => (
                <span key={m.month}>
                  {fmtMonth(m.month)} <b className="font-semibold text-foreground">{m.count}건</b>
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="@3xl/main:col-span-2 @6xl/main:col-span-4">
          <CardHeader>
            <CardTitle>코어 서비스 SLA 가용성</CardTitle>
            <CardDescription>최근 90일 · 목표 SLA 99.90%</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2.5">
              {serviceUptime.map((s) => {
                const st = uptimeStatus(s.uptime)
                return (
                  <li key={s.service} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1">
                    <span className="truncate font-mono text-[12.5px] font-semibold text-foreground">{s.service}</span>
                    <StatusPill status={st} label={fmtPct(s.uptime, 2)} icon={st === "good" ? CircleCheckIcon : TriangleAlertIcon} size="xs" className="w-20 justify-center" />
                    <div className="col-span-2 h-1.5 overflow-hidden rounded-full bg-black/[0.05] dark:bg-white/[0.07]">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          st === "good" ? "bg-status-good" : st === "warning" ? "bg-status-warning" : "bg-status-critical"
                        )}
                        style={{ width: `${Math.max(4, ((s.uptime - 99) / 1) * 100)}%` }}
                      />
                    </div>
                  </li>
                )
              })}
            </ul>
            <p className="mt-3 text-[11px] text-muted-foreground">막대는 99.0% ~ 100.0% 구간을 확대하여 미세 편차를 시각화합니다.</p>
          </CardContent>
        </Card>
      </div>

      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle>인시던트 타임라인</CardTitle>
            <CardDescription>최근 90일 장애 기록 및 근본 원인(RCA) 이력</CardDescription>
            <CardAction>
              <Tabs value={filter} onValueChange={(v) => setFilter(v as "all" | IncidentStatus)}>
                <TabsList>
                  <TabsTrigger value="all">
                    전체
                    <Badge variant="secondary" className="px-1.5 tabular-nums">{incidents.length}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="open">진행 중</TabsTrigger>
                  <TabsTrigger value="mitigated">완화됨</TabsTrigger>
                  <TabsTrigger value="resolved">해결됨</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-2xl border border-black/[0.055] dark:border-white/[0.065]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-72">인시던트</TableHead>
                    <TableHead>심각도</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead className="hidden md:table-cell">서비스</TableHead>
                    <TableHead className="hidden lg:table-cell">발생 시각</TableHead>
                    <TableHead className="hidden text-right md:table-cell">지속 시간</TableHead>
                    <TableHead className="hidden xl:table-cell">담당자</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((i) => {
                    const st = STATUS_META[i.status]
                    return (
                      <TableRow key={i.id} className={i.status === "open" ? "bg-[#FF3B30]/[0.04] dark:bg-[#FF453A]/[0.06]" : undefined}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-muted-foreground">{i.id}</span>
                            <span className="truncate font-semibold text-foreground">{i.title}</span>
                          </div>
                          <div className="mt-0.5 truncate text-xs text-muted-foreground">
                            영향: {i.impact}
                            {i.rootCause && <> · 원인: {i.rootCause}</>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={cn("inline-block rounded-full px-2 py-0.5 text-[11px] font-bold", SEV_CLASS[i.severity])} title={SEVERITY_DESC[i.severity]}>
                            {i.severity}
                          </span>
                        </TableCell>
                        <TableCell>
                          <StatusPill status={st.status} label={st.label} icon={st.icon} size="xs" />
                        </TableCell>
                        <TableCell className="hidden font-mono text-xs md:table-cell">{i.service}</TableCell>
                        <TableCell className="hidden text-xs text-muted-foreground whitespace-nowrap lg:table-cell">{fmtDateTime(i.startedAt)}</TableCell>
                        <TableCell className="hidden text-right tabular-nums md:table-cell">
                          {i.status === "resolved" ? (
                            fmtMinutes(i.durationMin)
                          ) : (
                            <span className="font-semibold text-tone-rose">{fmtMinutes(i.durationMin)} 경과</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden xl:table-cell">
                          <UserCell name={i.owner.name} hue={i.owner.hue} size="xs" />
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
    </>
  )
}
