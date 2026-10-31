import { MOCK_NOW, MOCK_TODAY, WEEK_STARTS, addDays, addMinutes, intBetween, mulberry32, pick, weekday } from "./core"
import { activeProjects } from "./projects"
import { committers, type MockUser } from "./users"

export type PipelineDay = { date: string; success: number; failed: number; canceled: number }

export const dailyPipelines: PipelineDay[] = (() => {
  const rand = mulberry32(7)
  const days: PipelineDay[] = []
  for (let i = 89; i >= 0; i--) {
    const date = addDays(MOCK_TODAY, -i)
    const dow = weekday(date)
    const weekend = dow === 0 || dow === 6
    const base = weekend ? 70 : 410
    const total = Math.round(base + rand() * base * 0.35 + (89 - i) * 1.1)
    const failRate = i === 12 ? 0.31 : 0.035 + rand() * 0.07 // one bad day two weeks ago
    const failed = Math.round(total * failRate)
    const canceled = Math.round(total * (0.01 + rand() * 0.025))
    days.push({ date, success: total - failed - canceled, failed, canceled })
  }
  return days
})()

export function successRate(days: PipelineDay[]) {
  const s = days.reduce((a, d) => a + d.success, 0)
  const f = days.reduce((a, d) => a + d.failed, 0)
  return (s / (s + f)) * 100
}

export const pipelines7d = dailyPipelines.slice(-7).reduce((a, d) => a + d.success + d.failed + d.canceled, 0)
export const pipelinesToday = dailyPipelines[dailyPipelines.length - 1]
export const successRate7d = successRate(dailyPipelines.slice(-7))
export const successRatePrev7d = successRate(dailyPipelines.slice(-14, -7))

/** p50 / p90 pipeline duration in minutes per week */
export const durationTrend = WEEK_STARTS.map((weekStart, w) => {
  const rand = mulberry32(900 + w)
  const p50 = Math.round((9.8 - w * 0.22 + rand() * 1.2) * 10) / 10
  const p90 = Math.round((p50 * (2.2 + rand() * 0.5)) * 10) / 10
  return { weekStart, p50, p90 }
})

export const avgQueueSeconds = 38
export const avgDurationMinutes = durationTrend[11].p50

export type StageName = "build" | "test" | "lint" | "security" | "deploy"

export const stageFailures: { stage: StageName; label: string; failures: number }[] = [
  { stage: "test", label: "test", failures: 212 },
  { stage: "build", label: "build", failures: 97 },
  { stage: "lint", label: "lint", failures: 64 },
  { stage: "security", label: "security", failures: 31 },
  { stage: "deploy", label: "deploy", failures: 14 },
]

export const projectPipelineStats = [...activeProjects]
  .map((p) => ({
    project: p.name,
    group: p.group,
    total30d: Math.round(p.commits30d * 2.6),
    successRate: p.pipelineSuccess30d,
    avgMinutes: p.avgPipelineMinutes,
  }))
  .sort((a, b) => b.total30d - a.total30d)

export type SlowJob = { job: string; project: string; stage: StageName; avgMinutes: number; runs7d: number; delta: number }

export const slowestJobs: SlowJob[] = [
  { job: "e2e:chromium", project: "web-console", stage: "test", avgMinutes: 21.4, runs7d: 84, delta: 2.1 },
  { job: "build:ios-release", project: "ios-app", stage: "build", avgMinutes: 18.9, runs7d: 23, delta: -0.6 },
  { job: "integration:order", project: "order-service", stage: "test", avgMinutes: 14.2, runs7d: 131, delta: 1.4 },
  { job: "docker:push", project: "payment-service", stage: "deploy", avgMinutes: 11.7, runs7d: 58, delta: 0.3 },
  { job: "sast", project: "gateway-api", stage: "security", avgMinutes: 9.8, runs7d: 96, delta: -1.2 },
  { job: "unit:android", project: "android-app", stage: "test", avgMinutes: 9.1, runs7d: 41, delta: 0.0 },
  { job: "terraform:plan", project: "infra-terraform", stage: "build", avgMinutes: 7.6, runs7d: 37, delta: 0.8 },
  { job: "dbt:run", project: "etl-pipelines", stage: "test", avgMinutes: 7.2, runs7d: 62, delta: -0.4 },
]

export type RecentPipeline = {
  id: number
  project: string
  ref: string
  status: "success" | "failed" | "running" | "canceled" | "pending"
  durationSeconds: number
  startedAt: string
  triggeredBy: MockUser
  source: "push" | "merge_request" | "schedule" | "web" | "api"
  failedStage?: StageName
}

export const recentPipelines: RecentPipeline[] = (() => {
  const rand = mulberry32(1234)
  const refs = ["main", "main", "develop", "feat/passkeys", "fix/coupon-refund", "release/2026.10", "chore/eslint-flat", "main"]
  return Array.from({ length: 14 }, (_, i) => {
    const status: RecentPipeline["status"] =
      i === 0 ? "running" : i === 1 ? "running" : i === 3 ? "failed" : i === 8 ? "failed" : i === 10 ? "canceled" : "success"
    const project = pick(rand, activeProjects)
    return {
      id: 88412 - i * 7 - intBetween(rand, 0, 5),
      project: project.name,
      ref: pick(rand, refs),
      status,
      durationSeconds: status === "running" ? intBetween(rand, 60, 400) : intBetween(rand, 140, 1500),
      startedAt: addMinutes(MOCK_NOW, -(i * 9 + intBetween(rand, 1, 7))),
      triggeredBy: pick(rand, committers),
      source: pick(rand, ["push", "merge_request", "merge_request", "push", "schedule", "web", "api"]),
      failedStage: status === "failed" ? (i === 3 ? "test" : "build") : undefined,
    }
  })
})()

export const runningCount = recentPipelines.filter((p) => p.status === "running").length
