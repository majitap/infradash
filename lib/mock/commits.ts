import {
  MOCK_TODAY,
  THIS_WEEK_START,
  WEEK_STARTS,
  addDays,
  intBetween,
  mulberry32,
  pick,
  weekday,
} from "./core"
import { activeProjects } from "./projects"
import { committers, type MockUser } from "./users"

export type DailyCommits = { date: string; count: number }

/** Weekday weights used to spread a weekly total over 7 days (Mon..Sun). */
const WEEKDAY_WEIGHTS = [0.205, 0.215, 0.2, 0.19, 0.145, 0.025, 0.02]

const HOLIDAYS = new Set([
  "2025-12-25", "2026-01-01", "2026-02-16", "2026-02-17", "2026-02-18",
  "2026-03-01", "2026-05-05", "2026-05-24", "2026-06-06", "2026-08-15",
  "2026-09-24", "2026-09-25", "2026-09-26", "2026-10-03", "2026-10-09",
])

/** weekly team totals for the last 12 weeks, derived from the users so leaderboards and charts agree */
export const weeklyTeamCommits = WEEK_STARTS.map((weekStart, w) => ({
  weekStart,
  count: committers.reduce((sum, u) => sum + u.weeklyCommits[w], 0),
}))

function buildDaily(): DailyCommits[] {
  const rand = mulberry32(31)
  const start = addDays(THIS_WEEK_START, -52 * 7) // 53 columns incl. this week
  const days: DailyCommits[] = []
  const totalDays = 53 * 7
  for (let i = 0; i < totalDays; i++) {
    const date = addDays(start, i)
    if (date > MOCK_TODAY) break
    const dow = weekday(date) // 0 Sun .. 6 Sat
    const monIdx = (dow + 6) % 7
    const weekIdx = WEEK_STARTS.findIndex((ws) => date >= ws && date < addDays(ws, 7))
    let count: number
    if (weekIdx >= 0) {
      const weekTotal = weeklyTeamCommits[weekIdx].count
      count = Math.round(weekTotal * WEEKDAY_WEIGHTS[monIdx] * (0.85 + rand() * 0.3))
    } else {
      const base = monIdx >= 5 ? 9 : 150
      const growth = 0.75 + (i / totalDays) * 0.35
      count = Math.round(base * growth * (0.7 + rand() * 0.6))
    }
    if (HOLIDAYS.has(date)) count = Math.round(count * 0.12)
    days.push({ date, count })
  }
  return days
}

export const dailyCommits: DailyCommits[] = buildDaily()

export const commits30d = dailyCommits
  .filter((d) => d.date > addDays(MOCK_TODAY, -30))
  .reduce((s, d) => s + d.count, 0)

export const commitsThisWeek = weeklyTeamCommits[11].count
export const commitsLastWeek = weeklyTeamCommits[10].count

/** 7 rows (Mon..Sun) x 24 columns: average commits per hour over the last 12 weeks */
export const hourlyMatrix: number[][] = (() => {
  const rand = mulberry32(99)
  const profile = [
    0.1, 0.05, 0.03, 0.02, 0.02, 0.05, 0.15, 0.4, 0.8, 1.2, 1.5, 1.4, 0.7, 1.1, 1.5, 1.6,
    1.45, 1.2, 0.9, 0.6, 0.45, 0.4, 0.3, 0.18,
  ]
  return Array.from({ length: 7 }, (_, dow) => {
    const dayFactor = dow >= 5 ? 0.12 : 1
    return profile.map((p) => Math.round(p * dayFactor * (14 + rand() * 6) * 10) / 10)
  })
})()

export type Period = "thisWeek" | "lastWeek" | "4w" | "12w"

export const PERIOD_LABELS: Record<Period, string> = {
  thisWeek: "이번 주",
  lastWeek: "지난주",
  "4w": "최근 4주",
  "12w": "최근 12주",
}

export type LeaderboardRow = {
  user: MockUser
  commits: number
  previous: number
  share: number
}

export function leaderboard(period: Period, limit = 10): LeaderboardRow[] {
  const range: [number, number] =
    period === "thisWeek" ? [11, 12] : period === "lastWeek" ? [10, 11] : period === "4w" ? [8, 12] : [0, 12]
  const prevRange: [number, number] =
    period === "thisWeek" ? [10, 11] : period === "lastWeek" ? [9, 10] : period === "4w" ? [4, 8] : [0, 0]
  const sum = (u: MockUser, [a, b]: [number, number]) =>
    u.weeklyCommits.slice(a, b).reduce((s, c) => s + c, 0)
  const rows = committers
    .map((user) => ({ user, commits: sum(user, range), previous: sum(user, prevRange), share: 0 }))
    .filter((r) => r.commits > 0)
    .sort((a, b) => b.commits - a.commits || a.user.name.localeCompare(b.user.name))
  const total = rows.reduce((s, r) => s + r.commits, 0) || 1
  return rows.slice(0, limit).map((r) => ({ ...r, share: (r.commits / total) * 100 }))
}

export const topStreaks = [...committers]
  .sort((a, b) => b.streakDays - a.streakDays)
  .slice(0, 5)

export const commitsByProject = [...activeProjects]
  .sort((a, b) => b.commits30d - a.commits30d)
  .slice(0, 8)
  .map((p) => ({ project: p.name, group: p.group, commits: p.commits30d }))

export type RecentCommit = {
  sha: string
  message: string
  author: MockUser
  project: string
  branch: string
  at: string
  additions: number
  deletions: number
  pipeline: "success" | "failed" | "running" | "pending"
}

const MESSAGES: [string, string, string][] = [
  ["feat(auth): 리프레시 토큰 회전 지원", "auth-service", "feat/refresh-token-rotation"],
  ["fix(orders): 취소 시 재고 복원 누락 수정", "order-service", "fix/cancel-restock"],
  ["chore(deps): next 16.4.3, react 19.3 업데이트", "web-console", "chore/deps-next-16"],
  ["perf(search): 인덱스 배치 크기 조정으로 처리량 2배", "search-indexer", "main"],
  ["refactor(payment): PG 어댑터 인터페이스 분리", "payment-service", "refactor/pg-adapter"],
  ["ci: 캐시 키에 lockfile 해시 포함", "ci-templates", "main"],
  ["feat(ui): DataTable 가상 스크롤 추가", "design-system", "feat/datatable-virtual"],
  ["fix(ios): 다크 모드에서 탭바 아이콘 대비 개선", "ios-app", "fix/tabbar-contrast"],
  ["docs: 온보딩 가이드 최신화", "web-console", "main"],
  ["feat(etl): 일별 파티션 백필 잡 추가", "etl-pipelines", "feat/daily-backfill"],
  ["infra: prod 노드풀 c6i로 교체", "infra-terraform", "main"],
  ["fix(android): 푸시 딥링크 파라미터 유실 수정", "android-app", "fix/push-deeplink"],
  ["feat(gateway): 레이트 리밋 헤더 노출", "gateway-api", "feat/ratelimit-headers"],
  ["test(feature-store): 서빙 API 통합 테스트 보강", "feature-store", "test/serving-api"],
]

export const recentCommits: RecentCommit[] = (() => {
  const rand = mulberry32(512)
  const hex = "0123456789abcdef"
  return MESSAGES.map(([message, project, branch], i) => {
    const minutesAgo = 6 + i * 37 + intBetween(rand, 0, 20)
    const d = new Date(`2026-10-31T10:12:00Z`)
    d.setUTCMinutes(d.getUTCMinutes() - minutesAgo)
    const at = d.toISOString().slice(0, 19)
    return {
      sha: Array.from({ length: 8 }, () => hex[intBetween(rand, 0, 15)]).join(""),
      message,
      author: pick(rand, committers),
      project,
      branch,
      at,
      additions: intBetween(rand, 4, 420),
      deletions: intBetween(rand, 0, 160),
      pipeline: i === 1 ? "failed" : i === 0 ? "running" : rand() < 0.9 ? "success" : "pending",
    }
  })
})()

/** 30-day commit totals per department */
export const commitsByDepartment = (() => {
  const map = new Map<string, number>()
  for (const u of committers) {
    const c = u.weeklyCommits.slice(8).reduce((a, b) => a + b, 0)
    map.set(u.department, (map.get(u.department) ?? 0) + c)
  }
  return [...map.entries()]
    .map(([department, commits]) => ({ department, commits }))
    .sort((a, b) => b.commits - a.commits)
})()

export const busiestDay = dailyCommits.reduce((best, d) => (d.count > best.count ? d : best), dailyCommits[0])
