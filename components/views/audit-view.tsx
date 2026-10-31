"use client"

import * as React from "react"
import { CircleCheckIcon, CircleXIcon, KeyRoundIcon, LogInIcon, ScrollTextIcon, SearchIcon, SettingsIcon } from "lucide-react"

import { BarList } from "@/components/dashboard/bar-list"
import { KpiGrid, KpiTile } from "@/components/dashboard/kpi-tile"
import { StatusPill } from "@/components/dashboard/status-pill"
import { UserAvatar, UserCell } from "@/components/dashboard/user-avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fmtDateTime, fmtInt, relativeTime } from "@/lib/format"
import { AUDIT_TYPE_LABELS, MOCK_NOW, auditEvents, auditTypeCounts, failedLogins24h, type AuditType } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

const TYPE_CLASS: Record<AuditType, string> = {
  auth: "bg-tone-indigo/12 text-tone-indigo",
  project: "bg-tone-emerald/12 text-tone-emerald",
  member: "bg-tone-violet/12 text-tone-violet",
  runner: "bg-tone-teal/12 text-tone-teal",
  settings: "bg-tone-amber/14 text-amber-800 dark:text-amber-300",
  token: "bg-tone-rose/12 text-tone-rose",
}

type Filter = "all" | AuditType

export function AuditView() {
  const [filter, setFilter] = React.useState<Filter>("all")
  const [query, setQuery] = React.useState("")
  const q = query.trim().toLowerCase()
  const rows = auditEvents
    .filter((e) => filter === "all" || e.type === filter)
    .filter((e) => !q || `${e.actor.name} ${e.actor.username} ${e.action} ${e.target} ${e.ip}`.toLowerCase().includes(q))

  const dayAgo = Date.parse(`${MOCK_NOW}Z`) - 86400000
  const last24h = auditEvents.filter((e) => Date.parse(`${e.at}Z`) >= dayAgo)
  const changes = auditEvents.filter((e) => e.type === "member" || e.type === "settings").length
  const tokens = auditEvents.filter((e) => e.type === "token").length

  const actorCounts = (() => {
    const map = new Map<number, { user: (typeof auditEvents)[number]["actor"]; count: number }>()
    for (const e of auditEvents) {
      const entry = map.get(e.actor.id) ?? { user: e.actor, count: 0 }
      entry.count += 1
      map.set(e.actor.id, entry)
    }
    return [...map.values()].sort((a, b) => b.count - a.count).slice(0, 6)
  })()

  const failed = auditEvents.filter((e) => e.result === "failed")

  return (
    <>
      <KpiGrid>
        <KpiTile label="24시간 이벤트" value={fmtInt(last24h.length)} unit="건" hint={`전체 보관 ${fmtInt(auditEvents.length)}건 표시 중`} icon={ScrollTextIcon} tone="sky" />
        <KpiTile
          label="로그인 실패"
          value={fmtInt(failedLogins24h)}
          unit="건"
          hint="같은 IP 반복 시 차단 규칙 검토"
          icon={LogInIcon}
          tone={failedLogins24h > 3 ? "rose" : "amber"}
        />
        <KpiTile label="권한 · 설정 변경" value={fmtInt(changes)} unit="건" hint="멤버 권한과 그룹/프로젝트 설정" icon={SettingsIcon} tone="violet" />
        <KpiTile label="토큰 발급 · 폐기" value={fmtInt(tokens)} unit="건" hint="개인 및 프로젝트 액세스 토큰" icon={KeyRoundIcon} tone="rose" />
      </KpiGrid>

      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @3xl/main:grid-cols-2 @6xl/main:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>유형별 이벤트</CardTitle>
            <CardDescription>표시 중인 이벤트 기준</CardDescription>
          </CardHeader>
          <CardContent>
            <BarList color="var(--chart-1)" items={auditTypeCounts.map((t) => ({ key: t.type, label: t.label, value: t.count }))} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>활동이 많은 사용자</CardTitle>
            <CardDescription>이벤트 수 상위 6명</CardDescription>
          </CardHeader>
          <CardContent>
            <BarList
              color="var(--chart-1)"
              items={actorCounts.map((a) => ({
                key: String(a.user.id),
                label: (
                  <span className="inline-flex items-center gap-2">
                    <UserAvatar name={a.user.name} hue={a.user.hue} size="xs" />
                    {a.user.name}
                  </span>
                ),
                value: a.count,
                secondary: a.user.isAdmin ? "관리자" : a.user.role,
              }))}
            />
          </CardContent>
        </Card>
        <Card className="@3xl/main:col-span-2 @6xl/main:col-span-1">
          <CardHeader>
            <CardTitle>실패한 이벤트</CardTitle>
            <CardDescription>{failed.length}건 · 최근 순</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {failed.slice(0, 6).map((e) => (
              <div key={e.id} className="flex items-center gap-3 rounded-lg border border-rose-500/20 bg-rose-500/5 px-3 py-2">
                <CircleXIcon className="size-4 shrink-0 text-rose-600 dark:text-rose-300" />
                <div className="min-w-0 flex-1 leading-tight">
                  <div className="truncate text-sm font-bold">
                    {e.action} · {e.actor.name}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {e.target} · {e.ip}
                  </div>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">{relativeTime(e.at)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle>감사 로그</CardTitle>
            <CardDescription>{rows.length}건 표시 · 최근 순</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
                <TabsList className="h-auto flex-wrap">
                  <TabsTrigger value="all">
                    전체
                    <Badge variant="secondary" className="px-1.5 tabular-nums">
                      {auditEvents.length}
                    </Badge>
                  </TabsTrigger>
                  {auditTypeCounts.map((t) => (
                    <TabsTrigger key={t.type} value={t.type}>
                      {t.label}
                      <Badge variant="secondary" className="px-1.5 tabular-nums">
                        {t.count}
                      </Badge>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              <div className="relative sm:w-72">
                <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="사용자, 작업, 대상, IP 검색" className="pl-8" aria-label="감사 로그 검색" />
              </div>
            </div>
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader className="bg-muted/60">
                  <TableRow>
                    <TableHead className="whitespace-nowrap">시각</TableHead>
                    <TableHead>행위자</TableHead>
                    <TableHead>유형</TableHead>
                    <TableHead>작업</TableHead>
                    <TableHead className="hidden md:table-cell">대상</TableHead>
                    <TableHead className="hidden lg:table-cell">IP</TableHead>
                    <TableHead>결과</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                        검색 결과가 없습니다.
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((e) => (
                      <TableRow key={e.id} className={e.result === "failed" ? "bg-rose-500/5" : undefined}>
                        <TableCell className="text-xs whitespace-nowrap">
                          <div className="font-medium">{fmtDateTime(e.at)}</div>
                          <div className="text-muted-foreground">{relativeTime(e.at)}</div>
                        </TableCell>
                        <TableCell>
                          <UserCell name={e.actor.name} hue={e.actor.hue} secondary={`@${e.actor.username}`} size="sm" />
                        </TableCell>
                        <TableCell>
                          <span className={cn("rounded px-1.5 py-px text-[11px] font-bold", TYPE_CLASS[e.type])}>{AUDIT_TYPE_LABELS[e.type]}</span>
                        </TableCell>
                        <TableCell className="font-medium whitespace-nowrap">{e.action}</TableCell>
                        <TableCell className="hidden max-w-72 truncate text-sm text-muted-foreground md:table-cell">{e.target}</TableCell>
                        <TableCell className="hidden font-mono text-xs text-muted-foreground lg:table-cell">{e.ip}</TableCell>
                        <TableCell>
                          {e.result === "success" ? (
                            <StatusPill status="good" label="성공" icon={CircleCheckIcon} size="xs" />
                          ) : (
                            <StatusPill status="critical" label="실패" icon={CircleXIcon} size="xs" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
