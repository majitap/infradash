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
  auth: "bg-tone-indigo/10 text-tone-indigo",
  project: "bg-tone-emerald/10 text-tone-emerald",
  member: "bg-tone-violet/10 text-tone-violet",
  runner: "bg-tone-teal/10 text-tone-teal",
  settings: "bg-tone-amber/14 text-tone-amber",
  token: "bg-tone-rose/10 text-tone-rose",
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
        <KpiTile label="24시간 감사 이벤트" value={fmtInt(last24h.length)} unit="건" hint={`보관 이벤트 총 ${fmtInt(auditEvents.length)}건`} icon={ScrollTextIcon} tone="sky" />
        <KpiTile
          label="로그인 실패"
          value={fmtInt(failedLogins24h)}
          unit="건"
          hint="동일 IP 반복 탐지 시 자동 차단 점검"
          icon={LogInIcon}
          tone={failedLogins24h > 3 ? "rose" : "amber"}
        />
        <KpiTile label="권한 · 시스템 설정 변경" value={fmtInt(changes)} unit="건" hint="그룹 멤버십 및 보호 브랜치 정책" icon={SettingsIcon} tone="violet" />
        <KpiTile label="액세스 토큰 발급 · 폐기" value={fmtInt(tokens)} unit="건" hint="PAT 및 프로젝트 배포 토큰" icon={KeyRoundIcon} tone="rose" />
      </KpiGrid>

      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @3xl/main:grid-cols-2 @6xl/main:grid-cols-12">
        <Card className="@6xl/main:col-span-4">
          <CardHeader>
            <CardTitle>카테고리별 이벤트</CardTitle>
            <CardDescription>전체 감사 로그 분포</CardDescription>
          </CardHeader>
          <CardContent>
            <BarList color="var(--chart-1)" items={auditTypeCounts.map((t) => ({ key: t.type, label: t.label, value: t.count }))} />
          </CardContent>
        </Card>

        <Card className="@6xl/main:col-span-4">
          <CardHeader>
            <CardTitle>주요 활동 계정</CardTitle>
            <CardDescription>관리·변경 이벤트 상위 6명</CardDescription>
          </CardHeader>
          <CardContent>
            <BarList
              color="var(--chart-7)"
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

        <Card className="@3xl/main:col-span-2 @6xl/main:col-span-4">
          <CardHeader>
            <CardTitle>거부 · 실패한 보안 이벤트</CardTitle>
            <CardDescription>최근 {failed.length}건 · 비정상 접근 모니터링</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {failed.slice(0, 6).map((e) => (
              <div
                key={e.id}
                className="flex items-center gap-3 rounded-2xl bg-[#FF3B30]/[0.05] px-3.5 py-2.5 ring-1 ring-[#FF3B30]/18 dark:bg-[#FF453A]/[0.08] dark:ring-[#FF453A]/25"
              >
                <CircleXIcon className="size-4 shrink-0 text-tone-rose" />
                <div className="min-w-0 flex-1 leading-snug">
                  <div className="truncate text-[13px] font-semibold text-foreground">
                    {e.action} · {e.actor.name}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {e.target} · <span className="font-mono">{e.ip}</span>
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
            <CardTitle>감사 로그 스트림</CardTitle>
            <CardDescription>{rows.length}건 표시 · 최신 이벤트 우선</CardDescription>
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
                <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="행위자, 작업, 대상, IP 검색" className="pl-9" aria-label="감사 로그 검색" />
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-black/[0.055] dark:border-white/[0.065]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">발생 시각</TableHead>
                    <TableHead>행위자</TableHead>
                    <TableHead>분류</TableHead>
                    <TableHead>수행 작업</TableHead>
                    <TableHead className="hidden md:table-cell">대상 리소스</TableHead>
                    <TableHead className="hidden lg:table-cell">출발지 IP</TableHead>
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
                      <TableRow key={e.id} className={e.result === "failed" ? "bg-[#FF3B30]/[0.035] dark:bg-[#FF453A]/[0.06]" : undefined}>
                        <TableCell className="text-xs whitespace-nowrap">
                          <div className="font-medium text-foreground">{fmtDateTime(e.at)}</div>
                          <div className="text-muted-foreground">{relativeTime(e.at)}</div>
                        </TableCell>
                        <TableCell>
                          <UserCell name={e.actor.name} hue={e.actor.hue} secondary={`@${e.actor.username}`} size="sm" />
                        </TableCell>
                        <TableCell>
                          <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", TYPE_CLASS[e.type])}>{AUDIT_TYPE_LABELS[e.type]}</span>
                        </TableCell>
                        <TableCell className="font-medium text-foreground whitespace-nowrap">{e.action}</TableCell>
                        <TableCell className="hidden max-w-72 truncate text-sm text-muted-foreground md:table-cell">{e.target}</TableCell>
                        <TableCell className="hidden font-mono text-xs text-muted-foreground lg:table-cell">{e.ip}</TableCell>
                        <TableCell>
                          {e.result === "success" ? (
                            <StatusPill status="good" label="성공" icon={CircleCheckIcon} size="xs" />
                          ) : (
                            <StatusPill status="critical" label="거부됨" icon={CircleXIcon} size="xs" />
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
