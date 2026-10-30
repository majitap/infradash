"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  CircleCheckIcon,
  CirclePauseIcon,
  CircleXIcon,
  RotateCwIcon,
} from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { runners, type MockRunner, type RunnerStatus } from "@/lib/mock-data"

const statusMeta: Record<
  RunnerStatus,
  { label: string; icon: React.ComponentType<{ className?: string }>; className: string }
> = {
  online: { label: "Online", icon: CircleCheckIcon, className: "text-emerald-600 dark:text-emerald-400" },
  offline: { label: "Offline", icon: CircleXIcon, className: "text-destructive" },
  paused: { label: "Paused", icon: CirclePauseIcon, className: "text-amber-600 dark:text-amber-400" },
}

function StatusBadge({ status }: { status: RunnerStatus }) {
  const meta = statusMeta[status]
  return (
    <Badge variant="outline" className="gap-1">
      <meta.icon className={`size-3.5 ${meta.className}`} />
      {meta.label}
    </Badge>
  )
}

type Filter = "all" | RunnerStatus

export function RunnersView() {
  const [filter, setFilter] = React.useState<Filter>("all")
  const [target, setTarget] = React.useState<MockRunner | null>(null)

  const counts = {
    all: runners.length,
    online: runners.filter((r) => r.status === "online").length,
    offline: runners.filter((r) => r.status === "offline").length,
    paused: runners.filter((r) => r.status === "paused").length,
  }

  const rows = filter === "all" ? runners : runners.filter((r) => r.status === filter)

  function confirmRestart() {
    if (!target) return
    toast.success(`Restart requested for ${target.name}`, {
      description: "Demo only: no request was sent. This dashboard uses mock data.",
    })
    setTarget(null)
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-3">
        {(["online", "offline", "paused"] as const).map((status) => {
          const meta = statusMeta[status]
          return (
            <Card key={status} size="sm">
              <CardHeader>
                <CardDescription className="flex items-center gap-1.5">
                  <meta.icon className={`size-4 ${meta.className}`} />
                  {meta.label}
                </CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums">
                  {counts[status]}
                </CardTitle>
              </CardHeader>
            </Card>
          )
        })}
      </div>

      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Runners</CardTitle>
            <CardDescription>
              Registered CI runners. Restart actions are simulated.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
              <TabsList>
                {(["all", "online", "offline", "paused"] as const).map((key) => (
                  <TabsTrigger key={key} value={key} className="capitalize">
                    {key} <Badge variant="secondary">{counts[key]}</Badge>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader className="bg-muted">
                  <TableRow>
                    <TableHead>Runner</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden lg:table-cell">Executor</TableHead>
                    <TableHead className="hidden md:table-cell">Tags</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead className="hidden text-right sm:table-cell">Jobs</TableHead>
                    <TableHead className="hidden lg:table-cell">Last contact</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <div className="font-medium">{r.name}</div>
                        <div className="text-xs text-muted-foreground">
                          #{r.id} · {r.ipAddress}
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={r.status} />
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">{r.executor}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {r.tags.map((t) => (
                            <Badge key={t} variant="secondary">
                              {t}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="tabular-nums">{r.version}</TableCell>
                      <TableCell className="hidden text-right tabular-nums sm:table-cell">
                        {r.jobsRunning} running
                        <div className="text-xs text-muted-foreground">
                          {r.jobsLast24h} / 24h
                        </div>
                      </TableCell>
                      <TableCell className="hidden tabular-nums lg:table-cell">
                        {r.lastContact}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => setTarget(r)}>
                          <RotateCwIcon />
                          Restart
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog
        open={target !== null}
        onOpenChange={(open) => {
          if (!open) setTarget(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restart {target?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              {target && target.jobsRunning > 0
                ? `${target.jobsRunning} running job(s) would be interrupted. `
                : ""}
              This is a demo, so nothing will actually be restarted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRestart}>Restart</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
