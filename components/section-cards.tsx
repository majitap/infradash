"use client"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  pipelineHistory,
  runners,
  upgradePlan,
  users,
  joiners,
  leavers,
} from "@/lib/mock-data"
import {
  TrendingUpIcon,
  TrendingDownIcon,
  ServerIcon,
  CircleArrowUpIcon,
} from "lucide-react"

function successRate(days: typeof pipelineHistory) {
  const success = days.reduce((sum, d) => sum + d.success, 0)
  const failed = days.reduce((sum, d) => sum + d.failed, 0)
  return (success / (success + failed)) * 100
}

export function SectionCards() {
  const activeUsers = users.filter((u) => u.status === "active").length
  const netChange = joiners.length - leavers.length

  const online = runners.filter((r) => r.status === "online").length
  const offline = runners.filter((r) => r.status === "offline").length
  const paused = runners.filter((r) => r.status === "paused").length

  const last7 = successRate(pipelineHistory.slice(-7))
  const prev7 = successRate(pipelineHistory.slice(-14, -7))
  const rateDelta = last7 - prev7
  const pipelines7d = pipelineHistory
    .slice(-7)
    .reduce((sum, d) => sum + d.success + d.failed, 0)

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Active Users</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {activeUsers}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {netChange >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
              {netChange >= 0 ? `+${netChange}` : netChange}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {joiners.length} joined, {leavers.length} left
          </div>
          <div className="text-muted-foreground">Last 30 days</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Runners Online</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {online} / {runners.length}
          </CardTitle>
          <CardAction>
            <Badge variant={offline > 0 ? "destructive" : "outline"}>
              {offline} offline
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {paused} paused <ServerIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">Fleet status right now</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Pipeline Success Rate</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {last7.toFixed(1)}%
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {rateDelta >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
              {rateDelta >= 0 ? "+" : ""}
              {rateDelta.toFixed(1)}pt
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {pipelines7d.toLocaleString("en-US")} pipelines
          </div>
          <div className="text-muted-foreground">Last 7 days vs previous 7</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>GitLab Version</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {upgradePlan.currentVersion}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <CircleArrowUpIcon />
              {upgradePlan.targetVersion}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Upgrade planned
          </div>
          <div className="text-muted-foreground">
            {upgradePlan.maintenanceWindow}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
