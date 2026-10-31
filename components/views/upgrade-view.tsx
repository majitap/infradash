"use client"

import * as React from "react"
import {
  CalendarClockIcon,
  CircleArrowUpIcon,
  CircleCheckIcon,
  CircleDashedIcon,
  ListChecksIcon,
  LoaderCircleIcon,
  RocketIcon,
  TriangleAlertIcon,
} from "lucide-react"

import { KpiGrid, KpiTile } from "@/components/dashboard/kpi-tile"
import { Section } from "@/components/dashboard/section-header"
import { Badge } from "@/components/ui/badge"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress"
import { fmtDate, fmtPct } from "@/lib/format"
import { breakingChanges, preUpgradeChecks, upgradePlan, upgradeSteps, type UpgradeStepStatus } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

const STEP_ICON: Record<UpgradeStepStatus, React.ReactNode> = {
  done: <CircleCheckIcon className="size-5 text-emerald-600 dark:text-emerald-300" />,
  "in-progress": <LoaderCircleIcon className="size-5 text-amber-600 dark:text-amber-300" />,
  pending: <CircleDashedIcon className="size-5 text-muted-foreground" />,
}

const NODE_CLASS: Record<UpgradeStepStatus | "current", string> = {
  current: "border-tone-indigo bg-tone-indigo/10 text-tone-indigo",
  done: "border-emerald-500/60 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  "in-progress": "border-amber-500/70 bg-amber-500/12 text-amber-800 dark:text-amber-300",
  pending: "border-border bg-muted/40 text-muted-foreground",
}

function initialState() {
  const state: Record<string, boolean> = {}
  for (const item of preUpgradeChecks) state[item.id] = item.done
  for (const step of upgradeSteps) for (const item of step.checklist) state[item.id] = item.done
  return state
}

function ChecklistItem({ id, label, checked, onChange }: { id: string; label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-3 rounded-md px-2 py-1.5 hover:bg-muted/50">
      <Checkbox id={id} checked={checked} onCheckedChange={(v) => onChange(v === true)} className="mt-0.5" />
      <span className={cn("text-sm", checked && "text-muted-foreground line-through")}>{label}</span>
    </label>
  )
}

export function UpgradeView() {
  const [checked, setChecked] = React.useState<Record<string, boolean>>(initialState)
  const toggle = (id: string) => (v: boolean) => setChecked((prev) => ({ ...prev, [id]: v }))

  const total = Object.keys(checked).length
  const done = Object.values(checked).filter(Boolean).length
  const percent = Math.round((done / total) * 100)

  const nodes = [
    { version: upgradePlan.currentVersion, label: "현재", status: "current" as const, date: "운영 중" },
    ...upgradeSteps.map((s) => ({
      version: s.version,
      label: s.kind === "target" ? "목표" : "필수 경유",
      status: s.status,
      date: `릴리스 ${fmtDate(s.releaseDate)}`,
    })),
  ]

  return (
    <>
      <KpiGrid>
        <KpiTile label="현재 버전" value={upgradePlan.currentVersion} hint={`${upgradePlan.product} · ${upgradePlan.edition}`} icon={CircleArrowUpIcon} tone="indigo" />
        <KpiTile label="목표 버전" value={upgradePlan.targetVersion} hint={`필수 경유 ${upgradeSteps.filter((s) => s.kind === "required-stop").length}회 · 릴리스 ${fmtDate(upgradeSteps[2].releaseDate)}`} icon={RocketIcon} tone="violet" />
        <KpiTile label="점검 창" value="11월 15일" hint={`02:00 ~ 06:00 KST · 예상 다운타임 ${upgradePlan.estimatedDowntimeMin}분`} icon={CalendarClockIcon} tone="amber" />
        <KpiTile label="체크리스트 진행률" value={fmtPct(percent, 0)} hint={`${done} / ${total} 항목 완료`} icon={ListChecksIcon} tone={percent >= 80 ? "emerald" : "sky"} />
      </KpiGrid>

      <Section>
        <Card>
          <CardHeader>
            <CardTitle>업그레이드 경로</CardTitle>
            <CardDescription>
              담당 {upgradePlan.owner} · PostgreSQL {upgradePlan.postgresVersion} · Redis {upgradePlan.redisVersion} · Gitaly {upgradePlan.gitalyNodes}노드
            </CardDescription>
            <CardAction>
              <Badge variant="outline" className="font-mono tabular-nums">
                {upgradePlan.currentVersion} → {upgradePlan.targetVersion}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <ol className="relative grid grid-cols-2 gap-3 @3xl/main:grid-cols-4">
              <span className="absolute top-7 right-[12%] left-[12%] hidden h-0.5 bg-border @3xl/main:block" aria-hidden="true" />
              {nodes.map((n) => (
                <li key={n.version} className="relative flex flex-col items-center gap-2 text-center">
                  <span className={cn("z-10 flex size-14 items-center justify-center rounded-full border-2 bg-card text-sm font-extrabold tabular-nums", NODE_CLASS[n.status])}>
                    {n.version.split(".").slice(0, 2).join(".")}
                  </span>
                  <div className="leading-tight">
                    <div className="font-mono font-bold">{n.version}</div>
                    <div className="text-xs text-muted-foreground">{n.label}</div>
                    <div className="text-[11px] text-muted-foreground/80">{n.date}</div>
                  </div>
                </li>
              ))}
            </ol>
            <Progress value={percent}>
              <ProgressLabel>전체 체크리스트</ProgressLabel>
              <ProgressValue>{() => `${done} / ${total} (${percent}%)`}</ProgressValue>
            </Progress>
          </CardContent>
        </Card>
      </Section>

      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @5xl/main:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>시작 전 점검</CardTitle>
            <CardDescription>전체 경로에 공통으로 적용되는 사전 조건</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            {preUpgradeChecks.map((item) => (
              <ChecklistItem key={item.id} id={item.id} label={item.label} checked={checked[item.id]} onChange={toggle(item.id)} />
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>주요 변경 사항</CardTitle>
            <CardDescription>경로상 호환성 영향이 있는 항목</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {breakingChanges.map((b) => {
              const noop = b.action === "조치 불필요"
              return (
                <div key={`${b.version}-${b.title}`} className={cn("flex items-start gap-3 rounded-lg border px-3 py-2.5", !noop && "border-amber-500/30 bg-amber-500/5")}>
                  {noop ? (
                    <CircleCheckIcon className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-300" />
                  ) : (
                    <TriangleAlertIcon className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-300" />
                  )}
                  <div className="min-w-0 flex-1 leading-tight">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">{b.version}</span>
                      <span className="text-sm font-bold">{b.title}</span>
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">{b.impact}</div>
                    <div className={cn("mt-0.5 text-xs font-bold", noop ? "text-muted-foreground" : "text-amber-800 dark:text-amber-300")}>→ {b.action}</div>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @5xl/main:grid-cols-3">
        {upgradeSteps.map((step, i) => {
          const stepDone = step.checklist.filter((c) => checked[c.id]).length
          return (
            <Card key={step.version} className={cn(step.status === "in-progress" && "ring-2 ring-amber-500/50")}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {STEP_ICON[step.status]}
                  {i + 1}단계 · {step.version}
                </CardTitle>
                <CardDescription>{step.notes}</CardDescription>
                <CardAction>
                  <Badge variant={step.kind === "target" ? "default" : "secondary"}>{step.kind === "target" ? "목표" : "필수 경유"}</Badge>
                </CardAction>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div>
                  <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                    <span>체크리스트</span>
                    <span className="tabular-nums">
                      {stepDone} / {step.checklist.length}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-tone-violet" style={{ width: `${(stepDone / step.checklist.length) * 100}%` }} />
                  </div>
                </div>
                <div className="flex flex-col gap-0.5">
                  {step.checklist.map((item) => (
                    <ChecklistItem key={item.id} id={item.id} label={item.label} checked={checked[item.id]} onChange={toggle(item.id)} />
                  ))}
                </div>
                <div className="rounded-lg bg-muted/60 px-3 py-2">
                  <div className="mb-1 text-xs font-bold text-muted-foreground">릴리스 하이라이트</div>
                  <ul className="list-inside list-disc text-xs leading-relaxed">
                    {step.highlights.map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </>
  )
}
