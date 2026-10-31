"use client"

import * as React from "react"
import {
  CircleCheckIcon,
  CircleXIcon,
  HourglassIcon,
  SearchIcon,
  ShieldCheckIcon,
  ShieldOffIcon,
  UserMinusIcon,
  UserPlusIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react"

import { TimeBarChart } from "@/components/charts/time-bar-chart"
import { BarList } from "@/components/dashboard/bar-list"
import { DonutChart } from "@/components/dashboard/donut-chart"
import { KpiGrid, KpiTile } from "@/components/dashboard/kpi-tile"
import { StatusPill } from "@/components/dashboard/status-pill"
import { UserCell } from "@/components/dashboard/user-avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fmtDate, fmtInt, fmtMonth, fmtPct, relativeTime } from "@/lib/format"
import {
  MONTHS,
  USER_CHANGE_WINDOW_DAYS,
  activeUsers,
  departmentCounts,
  joiners,
  leavers,
  roleCounts,
  twoFactorRate,
  users,
  type MockUser,
  type UserRole,
  type UserStatus,
} from "@/lib/mock-data"
import type { Status } from "@/lib/tones"

const STATUS_META: Record<UserStatus, { status: Status; label: string; icon: LucideIcon }> = {
  active: { status: "good", label: "활성", icon: CircleCheckIcon },
  blocked: { status: "critical", label: "차단됨", icon: CircleXIcon },
  deactivated: { status: "neutral", label: "비활성화", icon: CircleXIcon },
  pending: { status: "warning", label: "초대 대기", icon: HourglassIcon },
}

const ROLE_CLASS: Record<UserRole, string> = {
  Owner: "bg-tone-rose/12 text-tone-rose",
  Maintainer: "bg-tone-violet/12 text-tone-violet",
  Developer: "bg-tone-indigo/12 text-tone-indigo",
  Reporter: "bg-tone-sky/12 text-tone-sky",
  Guest: "bg-muted text-muted-foreground",
}

type Filter = "all" | "joiners" | "leavers" | "blocked" | "pending"

const FILTERS: { value: Filter; label: string; icon?: LucideIcon }[] = [
  { value: "all", label: "전체" },
  { value: "joiners", label: "입사자", icon: UserPlusIcon },
  { value: "leavers", label: "퇴사자", icon: UserMinusIcon },
  { value: "blocked", label: "차단됨" },
  { value: "pending", label: "초대 대기" },
]

function rowsFor(filter: Filter): MockUser[] {
  switch (filter) {
    case "joiners":
      return joiners
    case "leavers":
      return leavers
    case "blocked":
      return users.filter((u) => u.status === "blocked")
    case "pending":
      return users.filter((u) => u.status === "pending")
    default: {
      const c30 = (u: MockUser) => u.weeklyCommits.slice(8).reduce((a, b) => a + b, 0)
      return [...users].sort((a, b) => c30(b) - c30(a) || (b.lastActivity ?? "").localeCompare(a.lastActivity ?? ""))
    }
  }
}

const headcountTrend = MONTHS.map((month, i) => ({
  month,
  joiners: users.filter((u) => u.joinedAt.startsWith(month)).length + (i < 5 ? [4, 3, 6, 2, 5][i] : 0),
  leavers: i === 5 ? leavers.length : [2, 3, 1, 4, 2][i],
}))

export function UsersView() {
  const [filter, setFilter] = React.useState<Filter>("all")
  const [query, setQuery] = React.useState("")
  const q = query.trim().toLowerCase()
  const rows = rowsFor(filter).filter(
    (u) => !q || `${u.name} ${u.username} ${u.email} ${u.department} ${u.title} ${u.role}`.toLowerCase().includes(q)
  )
  const dateLabel = filter === "joiners" ? "입사일" : filter === "leavers" ? "퇴사일" : "마지막 활동"
  const maxCommits = Math.max(...users.map((u) => u.weeklyCommits.slice(8).reduce((a, b) => a + b, 0)), 1)
  const no2fa = users.filter((u) => u.status === "active" && !u.twoFactor).length

  return (
    <>
      <KpiGrid>
        <KpiTile
          label="활성 사용자"
          value={fmtInt(activeUsers.length)}
          unit="명"
          hint={`전체 계정 ${users.length} · 관리자 ${users.filter((u) => u.isAdmin).length}`}
          icon={UsersIcon}
          tone="indigo"
        />
        <KpiTile
          label={`${USER_CHANGE_WINDOW_DAYS}일 입사`}
          value={fmtInt(joiners.length)}
          unit="명"
          hint={joiners[0] ? `최근: ${joiners[0].name} (${fmtDate(joiners[0].joinedAt)})` : undefined}
          icon={UserPlusIcon}
          tone="emerald"
          spark={headcountTrend.map((m) => m.joiners)}
        />
        <KpiTile
          label={`${USER_CHANGE_WINDOW_DAYS}일 퇴사`}
          value={fmtInt(leavers.length)}
          unit="명"
          hint={leavers[0] ? `최근: ${leavers[0].name} (${fmtDate(leavers[0].leftAt ?? "")})` : undefined}
          icon={UserMinusIcon}
          tone="rose"
          spark={headcountTrend.map((m) => m.leavers)}
        />
        <KpiTile
          label="2FA 적용률"
          value={fmtPct(twoFactorRate, 0)}
          hint={`미적용 활성 사용자 ${no2fa}명 · 목표 100%`}
          icon={twoFactorRate >= 90 ? ShieldCheckIcon : ShieldOffIcon}
          tone={twoFactorRate >= 90 ? "emerald" : "amber"}
        />
      </KpiGrid>

      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @3xl/main:grid-cols-2 @6xl/main:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>역할 분포</CardTitle>
            <CardDescription>최고 권한 기준</CardDescription>
          </CardHeader>
          <CardContent>
            <DonutChart
              data={roleCounts.map((r, i) => ({ key: r.role, label: r.role, value: r.count, color: `var(--chart-${i + 1})` }))}
              centerValue={String(users.length)}
              centerLabel="계정"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>부서별 인원</CardTitle>
            <CardDescription>비활성화 계정 제외</CardDescription>
          </CardHeader>
          <CardContent>
            <BarList color="var(--chart-1)" items={departmentCounts.map((d) => ({ key: d.department, label: d.department, value: d.count, display: `${d.count}명` }))} />
          </CardContent>
        </Card>
        <Card className="@3xl/main:col-span-2 @6xl/main:col-span-1">
          <CardHeader>
            <CardTitle>입사 / 퇴사 추이</CardTitle>
            <CardDescription>최근 6개월 · 계정 생성과 비활성화</CardDescription>
          </CardHeader>
          <CardContent>
            <TimeBarChart
              data={headcountTrend}
              xKey="month"
              series={[
                { key: "joiners", label: "입사", color: "var(--chart-1)" },
                { key: "leavers", label: "퇴사", color: "var(--chart-2)" },
              ]}
              xFormatter={fmtMonth}
              valueFormatter={(v) => `${v}명`}
              className="h-56"
            />
          </CardContent>
        </Card>
      </div>

      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle>사용자</CardTitle>
            <CardDescription>
              {rows.length}명 표시 · 입사자와 퇴사자는 최근 {USER_CHANGE_WINDOW_DAYS}일 기준
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
                <TabsList className="h-auto flex-wrap">
                  {FILTERS.map((f) => (
                    <TabsTrigger key={f.value} value={f.value}>
                      {f.icon && <f.icon />}
                      {f.label}
                      <Badge variant="secondary" className="px-1.5 tabular-nums">
                        {rowsFor(f.value).length}
                      </Badge>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              <div className="relative sm:w-72">
                <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="이름, 아이디, 이메일, 부서 검색" className="pl-8" aria-label="사용자 검색" />
              </div>
            </div>
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader className="bg-muted/60">
                  <TableRow>
                    <TableHead className="min-w-56">사용자</TableHead>
                    <TableHead className="hidden md:table-cell">부서 · 직함</TableHead>
                    <TableHead>역할</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead className="hidden text-center xl:table-cell">2FA</TableHead>
                    <TableHead className="hidden lg:table-cell">30일 커밋</TableHead>
                    <TableHead className="text-right">{dateLabel}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                        해당하는 사용자가 없습니다.
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((u) => {
                      const st = STATUS_META[u.status]
                      const c30 = u.weeklyCommits.slice(8).reduce((a, b) => a + b, 0)
                      const dateValue = filter === "joiners" ? u.joinedAt : filter === "leavers" ? u.leftAt : u.lastActivity
                      return (
                        <TableRow key={u.id} className={u.status === "deactivated" ? "opacity-60" : undefined}>
                          <TableCell title={u.email}>
                            <UserCell name={u.name} hue={u.hue} secondary={`@${u.username}`} size="md" />
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="font-medium">{u.department}</div>
                            <div className="text-xs text-muted-foreground">{u.title}</div>
                          </TableCell>
                          <TableCell>
                            <span className={`rounded px-1.5 py-px text-[11px] font-bold ${ROLE_CLASS[u.role]}`}>{u.role}</span>
                            {u.isAdmin && <span className="ml-1 rounded bg-amber-500/14 px-1.5 py-px text-[11px] font-bold text-amber-800 dark:text-amber-300">관리자</span>}
                          </TableCell>
                          <TableCell>
                            <StatusPill status={st.status} label={st.label} icon={st.icon} size="xs" />
                          </TableCell>
                          <TableCell className="hidden text-center xl:table-cell">
                            {u.twoFactor ? (
                              <ShieldCheckIcon className="mx-auto size-4 text-emerald-600 dark:text-emerald-300" aria-label="2FA 사용" />
                            ) : (
                              <ShieldOffIcon className="mx-auto size-4 text-muted-foreground/60" aria-label="2FA 미사용" />
                            )}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
                                <div className="h-full rounded-full bg-tone-violet" style={{ width: `${(c30 / maxCommits) * 100}%` }} />
                              </div>
                              <span className="w-8 text-right text-xs tabular-nums">{c30}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-xs text-muted-foreground whitespace-nowrap">
                            {dateValue ? (filter === "all" ? relativeTime(dateValue) : fmtDate(dateValue)) : "—"}
                          </TableCell>
                        </TableRow>
                      )
                    })
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
