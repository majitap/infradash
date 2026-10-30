"use client"

import * as React from "react"
import {
  ArrowRightIcon,
  CircleCheckIcon,
  CircleDashedIcon,
  LoaderCircleIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  preUpgradeChecks,
  upgradePlan,
  upgradeSteps,
  type UpgradeStepStatus,
} from "@/lib/mock-data"

const stepIcon: Record<UpgradeStepStatus, React.ReactNode> = {
  done: <CircleCheckIcon className="size-5 text-emerald-600 dark:text-emerald-400" />,
  "in-progress": <LoaderCircleIcon className="size-5 text-amber-600 dark:text-amber-400" />,
  pending: <CircleDashedIcon className="size-5 text-muted-foreground" />,
}

function initialState() {
  const state: Record<string, boolean> = {}
  for (const item of preUpgradeChecks) state[item.id] = item.done
  for (const step of upgradeSteps) {
    for (const item of step.checklist) state[item.id] = item.done
  }
  return state
}

function ChecklistItem({
  id,
  label,
  checked,
  onChange,
}: {
  id: string
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-start gap-3 rounded-md px-2 py-1.5 hover:bg-muted/50"
    >
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(value) => onChange(value === true)}
        className="mt-0.5"
      />
      <span className={checked ? "text-muted-foreground line-through" : undefined}>
        {label}
      </span>
    </label>
  )
}

export function UpgradeView() {
  const [checked, setChecked] = React.useState<Record<string, boolean>>(initialState)

  const toggle = (id: string) => (value: boolean) =>
    setChecked((prev) => ({ ...prev, [id]: value }))

  const total = Object.keys(checked).length
  const doneCount = Object.values(checked).filter(Boolean).length
  const percent = Math.round((doneCount / total) * 100)

  const path = [
    { version: upgradePlan.currentVersion, label: "Current" },
    ...upgradeSteps.map((s) => ({
      version: s.version,
      label: s.kind === "target" ? "Target" : "Required stop",
    })),
  ]

  return (
    <>
      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Upgrade path</CardTitle>
            <CardDescription>
              {upgradePlan.product} · owner: {upgradePlan.owner} · window:{" "}
              {upgradePlan.maintenanceWindow}
            </CardDescription>
            <CardAction>
              <Badge variant="outline" className="tabular-nums">
                {upgradePlan.currentVersion} → {upgradePlan.targetVersion}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <ol className="flex flex-wrap items-center gap-2">
              {path.map((p, i) => (
                <React.Fragment key={p.version}>
                  {i > 0 && <ArrowRightIcon className="size-4 text-muted-foreground" />}
                  <li className="flex flex-col rounded-lg border px-3 py-2">
                    <span className="text-xs text-muted-foreground">{p.label}</span>
                    <span className="font-semibold tabular-nums">{p.version}</span>
                  </li>
                </React.Fragment>
              ))}
            </ol>
            <Progress value={percent}>
              <ProgressLabel>Overall checklist</ProgressLabel>
              <ProgressValue>
                {() => `${doneCount} / ${total} (${percent}%)`}
              </ProgressValue>
            </Progress>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @5xl/main:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Before you start</CardTitle>
            <CardDescription>Pre-upgrade checks for the whole path</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            {preUpgradeChecks.map((item) => (
              <ChecklistItem
                key={item.id}
                id={item.id}
                label={item.label}
                checked={checked[item.id]}
                onChange={toggle(item.id)}
              />
            ))}
          </CardContent>
        </Card>

        {upgradeSteps.map((step, i) => {
          const stepDone = step.checklist.filter((c) => checked[c.id]).length
          return (
            <Card key={step.version}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {stepIcon[step.status]}
                  Step {i + 1}: {step.version}
                </CardTitle>
                <CardDescription>{step.notes}</CardDescription>
                <CardAction>
                  <Badge variant={step.kind === "target" ? "default" : "secondary"}>
                    {step.kind === "target" ? "Target" : "Required stop"}
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardContent className="flex flex-col gap-1">
                <div className="mb-1 text-xs text-muted-foreground tabular-nums">
                  {stepDone} / {step.checklist.length} done
                </div>
                <Separator className="mb-1" />
                {step.checklist.map((item) => (
                  <ChecklistItem
                    key={item.id}
                    id={item.id}
                    label={item.label}
                    checked={checked[item.id]}
                    onChange={toggle(item.id)}
                  />
                ))}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </>
  )
}
