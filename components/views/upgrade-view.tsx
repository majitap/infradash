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
  SparklesIcon,
  TriangleAlertIcon,
} from "lucide-react"

import { KpiGrid, KpiTile } from "@/components/dashboard/kpi-tile"
import { Section } from "@/components/dashboard/section-header"
import { Badge } from "@/components/ui/badge"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { fmtDate, fmtPct } from "@/lib/format"
import { breakingChanges, preUpgradeChecks, upgradePlan, upgradeSteps, type UpgradeStepStatus } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

const STEP_ICON: Record<UpgradeStepStatus, React.ReactNode> = {
  done: <CircleCheckIcon className="size-4.5 text-tone-emerald" />,
  "in-progress": <LoaderCircleIcon className="size-4.5 text-tone-amber" />,
  pending: <CircleDashedIcon className="size-4.5 text-muted-foreground" />,
}

const NODE_CLASS: Record<UpgradeStepStatus | "current", string> = {
  current: "border-tone-indigo bg-tone-indigo/12 text-tone-indigo shadow-[0_0_0_4px_rgba(88,86,214,0.1)]",
  done: "border-tone-emerald/60 bg-tone-emerald/12 text-tone-emerald",
  "in-progress": "border-tone-amber/70 bg-tone-amber/14 text-tone-amber shadow-[0_0_0_4px_rgba(255,159,10,0.12)]",
  pending: "border-black/[0.08] bg-card text-muted-foreground dark:border-white/[0.12]",
}

function initialState() {
  const state: Record<string, boolean> = {}
  for (const item of preUpgradeChecks) state[item.id] = item.done
  for (const step of upgradeSteps) for (const item of step.checklist) state[item.id] = item.done
  return state
}

function ChecklistItem({ id, label, checked, onChange }: { id: string; label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-3 rounded-xl px-2.5 py-2 transition-colors hover:bg-black/[0.025] dark:hover:bg-white/[0.035]">
      <Checkbox id={id} checked={checked} onCheckedChange={(v) => onChange(v === true)} className="mt-0.5" />
      <span className={cn("text-[13.5px] leading-snug", checked ? "text-muted-foreground line-through" : "font-medium text-foreground")}>{label}</span>
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
    { version: upgradePlan.currentVersion, label: "현재 운영 중", status: "current" as const, date: "프로덕션" },
    ...upgradeSteps.map((s) => ({
      version: s.version,
      label: s.kind === "target" ? "최종 목표 릴리스" : "필수 경유 (Required Stop)",
      status: s.status,
      date: `릴리스 ${fmtDate(s.releaseDate)}`,
    })),
  ]

  return (
    <>
      <KpiGrid>
        <KpiTile label="현재 설치 버전" value={upgradePlan.currentVersion} hint={`${upgradePlan.product} · ${upgradePlan.edition}`} icon={CircleArrowUpIcon} tone="indigo" />
        <KpiTile
          label="목표 업데이트 버전"
          value={upgradePlan.targetVersion}
          hint={`필수 경유 ${upgradeSteps.filter((s) => s.kind === "required-stop").length}회 · ${fmtDate(upgradeSteps[2].releaseDate)}`}
          icon={RocketIcon}
          tone="violet"
        />
        <KpiTile
          label="예정 점검 윈도우"
          value="11월 15일"
          hint={`02:00 ~ 06:00 KST · 예상 중단 ${upgradePlan.estimatedDowntimeMin}분`}
          icon={CalendarClockIcon}
          tone="amber"
        />
        <KpiTile label="사전 준비율" value={fmtPct(percent, 0)} hint={`${done} / ${total} 항목 체크 완료`} icon={ListChecksIcon} tone={percent >= 80 ? "emerald" : "sky"} />
      </KpiGrid>

      <Section>
        <Card className="relative overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -right-20 size-72 rounded-full bg-gradient-to-br from-[#AF52DE]/12 via-[#5856D6]/8 to-transparent blur-2xl"
          />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SparklesIcon className="size-4 text-tone-violet" />
              소프트웨어 업데이트 경로 (Zero-Skip Path)
            </CardTitle>
            <CardDescription>
              담당 {upgradePlan.owner} · PostgreSQL {upgradePlan.postgresVersion} · Redis {upgradePlan.redisVersion} · Gitaly {upgradePlan.gitalyNodes}노드
            </CardDescription>
            <CardAction>
              <span className="rounded-full bg-tone-violet/12 px-3 py-1 font-mono text-xs font-semibold text-tone-violet tabular-nums">
                {upgradePlan.currentVersion} → {upgradePlan.targetVersion}
              </span>
            </CardAction>
          </CardHeader>
          <CardContent className="relative flex flex-col gap-6">
            <ol className="relative grid grid-cols-2 gap-4 @3xl/main:grid-cols-4">
              <span className="absolute top-7.5 right-[12%] left-[12%] hidden h-[2px] bg-black/[0.07] @3xl/main:block dark:bg-white/[0.1]" aria-hidden="true" />
              {nodes.map((n) => (
                <li key={n.version} className="relative flex flex-col items-center gap-2.5 text-center">
                  <span className={cn("z-10 flex size-15 items-center justify-center rounded-full border-2 bg-card text-sm font-bold tabular-nums transition-all", NODE_CLASS[n.status])}>
                    {n.version.split(".").slice(0, 2).join(".")}
                  </span>
                  <div className="leading-snug">
                    <div className="font-mono text-[13.5px] font-bold text-foreground">{n.version}</div>
                    <div className="text-xs font-medium text-muted-foreground">{n.label}</div>
                    <div className="text-[11px] text-muted-foreground/75">{n.date}</div>
                  </div>
                </li>
              ))}
            </ol>

            <div className="apple-inset-well rounded-2xl p-4">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">전체 업그레이드 런북 진행률</span>
                <span className="font-semibold text-muted-foreground tabular-nums">
                  {done} / {total} 완료 ({percent}%)
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-black/[0.06] dark:bg-white/[0.08]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#007AFF] via-[#5856D6] to-[#AF52DE] transition-all duration-300"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </Section>

      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @5xl/main:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>공통 사전 점검 (Pre-flight Checks)</CardTitle>
            <CardDescription>점검 창 진입 전 반드시 완료해야 하는 필수 검증 항목</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-0.5">
            {preUpgradeChecks.map((item) => (
              <ChecklistItem key={item.id} id={item.id} label={item.label} checked={checked[item.id]} onChange={toggle(item.id)} />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>호환성 및 주요 변경 사항</CardTitle>
            <CardDescription>업그레이드 경로상 브레이킹 체인지 및 조치 가이드</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2.5">
            {breakingChanges.map((b) => {
              const noop = b.action === "조치 불필요"
              return (
                <div
                  key={`${b.version}-${b.title}`}
                  className={cn(
                    "flex items-start gap-3 rounded-2xl px-3.5 py-3 ring-1",
                    noop
                      ? "bg-black/[0.018] ring-black/[0.045] dark:bg-white/[0.025] dark:ring-white/[0.055]"
                      : "bg-tone-amber/[0.07] ring-tone-amber/25"
                  )}
                >
                  {noop ? (
                    <CircleCheckIcon className="mt-0.5 size-4 shrink-0 text-tone-emerald" />
                  ) : (
                    <TriangleAlertIcon className="mt-0.5 size-4 shrink-0 text-tone-amber" />
                  )}
                  <div className="min-w-0 flex-1 leading-snug">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-black/[0.05] px-1.5 py-0.5 font-mono text-[11px] font-semibold text-muted-foreground dark:bg-white/[0.08]">
                        {b.version}
                      </span>
                      <span className="text-[13.5px] font-semibold text-foreground">{b.title}</span>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">{b.impact}</div>
                    <div className={cn("mt-1 text-xs font-semibold", noop ? "text-muted-foreground" : "text-tone-amber")}>→ {b.action}</div>
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
            <Card key={step.version} className={cn(step.status === "in-progress" && "ring-1 ring-tone-amber/45")}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {STEP_ICON[step.status]}
                  {i + 1}단계 · {step.version}
                </CardTitle>
                <CardDescription>{step.notes}</CardDescription>
                <CardAction>
                  <Badge variant={step.kind === "target" ? "default" : "secondary"} className="rounded-full">
                    {step.kind === "target" ? "목표 버전" : "필수 경유"}
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col justify-between gap-3.5">
                <div className="flex flex-col gap-3">
                  <div>
                    <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
                      <span>단계 체크리스트</span>
                      <span className="font-semibold text-foreground tabular-nums">
                        {stepDone} / {step.checklist.length}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-black/[0.06] dark:bg-white/[0.08]">
                      <div
                        className="h-full rounded-full bg-tone-violet transition-all duration-300"
                        style={{ width: `${(stepDone / step.checklist.length) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    {step.checklist.map((item) => (
                      <ChecklistItem key={item.id} id={item.id} label={item.label} checked={checked[item.id]} onChange={toggle(item.id)} />
                    ))}
                  </div>
                </div>

                <div className="apple-inset-well rounded-2xl px-3.5 py-3">
                  <div className="mb-1 text-[11.5px] font-semibold text-muted-foreground">주요 릴리스 노트</div>
                  <ul className="list-inside list-disc space-y-0.5 text-xs leading-relaxed text-foreground/85">
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
