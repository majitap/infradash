/**
 * Mock data for InfraDash.
 *
 * Every value in this file is fake. The dashboard never calls a real API and
 * never uses tokens: all pages read from the exports below only.
 * Values are generated deterministically (fixed reference date + seeded PRNG)
 * so that the static export renders identically on the server and client.
 */

export const MOCK_TODAY = "2026-10-31"

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function addDays(isoDate: string, days: number) {
  const d = new Date(`${isoDate}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

// ---------------------------------------------------------------------------
// current user (sidebar footer)
// ---------------------------------------------------------------------------

export const currentUser = {
  name: "Infra Admin",
  email: "admin@example.com",
}

// ---------------------------------------------------------------------------
// users
// ---------------------------------------------------------------------------

export type UserRole = "Owner" | "Maintainer" | "Developer" | "Reporter"
export type UserStatus = "active" | "blocked" | "deactivated"

export type MockUser = {
  id: number
  name: string
  username: string
  email: string
  department: string
  role: UserRole
  status: UserStatus
  joinedAt: string
  leftAt: string | null
  lastActivity: string | null
}

const firstNames = [
  "Minjun", "Seoyeon", "Jiho", "Hayoon", "Doyun", "Jiwoo", "Eunwoo", "Sua",
  "Siwoo", "Jia", "Junseo", "Yerin", "Hyunwoo", "Chaewon", "Taeyang", "Yuna",
  "Gunwoo", "Dahye", "Joonho", "Sohee", "Mingyu", "Nari", "Woojin", "Bora",
]
const lastNames = ["Kim", "Lee", "Park", "Choi", "Jung", "Kang", "Cho", "Yoon", "Jang", "Lim"]
const departments = ["Platform", "Backend", "Frontend", "Data", "Mobile", "QA", "Security", "SRE"]
const roles: UserRole[] = ["Developer", "Developer", "Developer", "Maintainer", "Reporter", "Owner"]

function buildUsers(): MockUser[] {
  const rand = mulberry32(42)
  const users: MockUser[] = []
  for (let i = 0; i < 48; i++) {
    const first = firstNames[i % firstNames.length]
    const last = lastNames[Math.floor(rand() * lastNames.length)]
    const username = `${first.toLowerCase()}.${last.toLowerCase()}${i}`
    const joinedAt = addDays(MOCK_TODAY, -Math.floor(rand() * 900) - 1)

    let status: UserStatus = "active"
    let leftAt: string | null = null
    if (i % 9 === 4) {
      status = "deactivated"
      leftAt = addDays(MOCK_TODAY, -Math.floor(rand() * 30))
    } else if (i % 13 === 7) {
      status = "blocked"
    }

    const lastActivity =
      status === "deactivated" ? leftAt : addDays(MOCK_TODAY, -Math.floor(rand() * 20))

    users.push({
      id: 1000 + i,
      name: `${first} ${last}`,
      username,
      email: `${username}@example.com`,
      department: departments[Math.floor(rand() * departments.length)],
      role: roles[Math.floor(rand() * roles.length)],
      status,
      joinedAt,
      leftAt,
      lastActivity,
    })
  }

  // guarantee a handful of recent joiners
  const recent = [3, 11, 18, 26, 33, 41]
  recent.forEach((idx, n) => {
    const u = users[idx]
    if (u.status === "active") {
      u.joinedAt = addDays(MOCK_TODAY, -(n * 5 + 2))
      u.lastActivity = addDays(MOCK_TODAY, -Math.min(n, 2))
    }
  })
  return users
}

export const users: MockUser[] = buildUsers()

/** window used for the Joiners / Leavers tabs */
export const USER_CHANGE_WINDOW_DAYS = 30

export const joiners = users.filter(
  (u) => u.joinedAt >= addDays(MOCK_TODAY, -USER_CHANGE_WINDOW_DAYS)
)
export const leavers = users.filter(
  (u) => u.leftAt !== null && u.leftAt >= addDays(MOCK_TODAY, -USER_CHANGE_WINDOW_DAYS)
)

// ---------------------------------------------------------------------------
// runners
// ---------------------------------------------------------------------------

export type RunnerStatus = "online" | "offline" | "paused"

export type MockRunner = {
  id: number
  name: string
  description: string
  executor: "docker" | "kubernetes" | "shell" | "docker-autoscaler"
  tags: string[]
  status: RunnerStatus
  version: string
  ipAddress: string
  jobsRunning: number
  jobsLast24h: number
  lastContact: string
}

export const runners: MockRunner[] = [
  { id: 101, name: "build-docker-01", description: "Shared docker builder", executor: "docker", tags: ["docker", "linux", "amd64"], status: "online", version: "18.4.1", ipAddress: "10.20.1.11", jobsRunning: 3, jobsLast24h: 412, lastContact: "2026-10-31 09:41" },
  { id: 102, name: "build-docker-02", description: "Shared docker builder", executor: "docker", tags: ["docker", "linux", "amd64"], status: "online", version: "18.4.1", ipAddress: "10.20.1.12", jobsRunning: 2, jobsLast24h: 388, lastContact: "2026-10-31 09:41" },
  { id: 103, name: "build-docker-03", description: "Shared docker builder", executor: "docker", tags: ["docker", "linux", "amd64"], status: "offline", version: "18.2.0", ipAddress: "10.20.1.13", jobsRunning: 0, jobsLast24h: 0, lastContact: "2026-10-29 22:05" },
  { id: 104, name: "k8s-autoscale-a", description: "EKS autoscaling pool A", executor: "kubernetes", tags: ["k8s", "autoscale"], status: "online", version: "18.4.1", ipAddress: "10.30.0.21", jobsRunning: 7, jobsLast24h: 951, lastContact: "2026-10-31 09:42" },
  { id: 105, name: "k8s-autoscale-b", description: "EKS autoscaling pool B", executor: "kubernetes", tags: ["k8s", "autoscale"], status: "online", version: "18.4.1", ipAddress: "10.30.0.22", jobsRunning: 5, jobsLast24h: 870, lastContact: "2026-10-31 09:42" },
  { id: 106, name: "gpu-runner-01", description: "CUDA test runner", executor: "docker", tags: ["gpu", "cuda", "linux"], status: "paused", version: "18.3.2", ipAddress: "10.40.2.5", jobsRunning: 0, jobsLast24h: 14, lastContact: "2026-10-31 09:30" },
  { id: 107, name: "arm64-builder", description: "ARM64 image builder", executor: "docker-autoscaler", tags: ["arm64", "docker"], status: "online", version: "18.4.1", ipAddress: "10.20.3.7", jobsRunning: 1, jobsLast24h: 133, lastContact: "2026-10-31 09:40" },
  { id: 108, name: "macos-ios-01", description: "iOS build host", executor: "shell", tags: ["macos", "xcode"], status: "offline", version: "17.11.3", ipAddress: "10.50.0.8", jobsRunning: 0, jobsLast24h: 0, lastContact: "2026-10-27 18:12" },
  { id: 109, name: "macos-ios-02", description: "iOS build host", executor: "shell", tags: ["macos", "xcode"], status: "online", version: "18.4.1", ipAddress: "10.50.0.9", jobsRunning: 1, jobsLast24h: 57, lastContact: "2026-10-31 09:39" },
  { id: 110, name: "deploy-prod", description: "Protected deploy runner", executor: "shell", tags: ["deploy", "protected"], status: "paused", version: "18.4.1", ipAddress: "10.10.0.3", jobsRunning: 0, jobsLast24h: 6, lastContact: "2026-10-31 08:55" },
  { id: 111, name: "windows-msbuild", description: "Windows MSBuild host", executor: "shell", tags: ["windows", "msbuild"], status: "online", version: "18.3.2", ipAddress: "10.60.0.4", jobsRunning: 0, jobsLast24h: 42, lastContact: "2026-10-31 09:38" },
  { id: 112, name: "e2e-browser-01", description: "Playwright e2e runner", executor: "docker", tags: ["e2e", "browser"], status: "offline", version: "18.1.0", ipAddress: "10.20.4.2", jobsRunning: 0, jobsLast24h: 0, lastContact: "2026-10-30 03:47" },
]

// ---------------------------------------------------------------------------
// pipelines (Overview chart)
// ---------------------------------------------------------------------------

export type PipelineDay = { date: string; success: number; failed: number }

function buildPipelineHistory(): PipelineDay[] {
  const rand = mulberry32(7)
  const days: PipelineDay[] = []
  for (let i = 89; i >= 0; i--) {
    const date = addDays(MOCK_TODAY, -i)
    const weekday = new Date(`${date}T00:00:00Z`).getUTCDay()
    const weekend = weekday === 0 || weekday === 6
    const base = weekend ? 90 : 420
    const success = Math.round(base + rand() * base * 0.35 + (89 - i) * 1.2)
    const failed = Math.round(success * (0.04 + rand() * 0.08))
    days.push({ date, success, failed })
  }
  return days
}

export const pipelineHistory: PipelineDay[] = buildPipelineHistory()

/** monthly joiners / leavers for the Overview bar chart */
export const headcountTrend = [
  { month: "2026-05", joiners: 6, leavers: 2 },
  { month: "2026-06", joiners: 4, leavers: 3 },
  { month: "2026-07", joiners: 9, leavers: 1 },
  { month: "2026-08", joiners: 3, leavers: 4 },
  { month: "2026-09", joiners: 7, leavers: 2 },
  { month: "2026-10", joiners: joiners.length, leavers: leavers.length },
]

// ---------------------------------------------------------------------------
// upgrade path
// ---------------------------------------------------------------------------

export type UpgradeStepStatus = "done" | "in-progress" | "pending"

export type UpgradeStep = {
  version: string
  kind: "required-stop" | "target"
  status: UpgradeStepStatus
  notes: string
  checklist: { id: string; label: string; done: boolean }[]
}

export const upgradePlan = {
  product: "GitLab (self-managed)",
  currentVersion: "17.8.7",
  targetVersion: "18.5.2",
  maintenanceWindow: "2026-11-15 02:00 - 06:00 KST",
  owner: "Platform team",
}

const stopChecklist = (v: string, doneCount: number) =>
  [
    { id: `${v}-backup`, label: "Take full backup and snapshot the Gitaly volumes" },
    { id: `${v}-migrations`, label: "Confirm background migrations are finished" },
    { id: `${v}-upgrade`, label: `Upgrade packages to ${v}` },
    { id: `${v}-smoke`, label: "Run smoke tests (login, clone, pipeline, registry)" },
  ].map((item, i) => ({ ...item, done: i < doneCount }))

export const upgradeSteps: UpgradeStep[] = [
  {
    version: "17.11.7",
    kind: "required-stop",
    status: "done",
    notes: "Required stop. Batched background migrations must finish before continuing.",
    checklist: stopChecklist("17.11.7", 4),
  },
  {
    version: "18.2.8",
    kind: "required-stop",
    status: "in-progress",
    notes: "Required stop. Check deprecated CI/CD keywords and runner token changes.",
    checklist: stopChecklist("18.2.8", 2),
  },
  {
    version: "18.5.2",
    kind: "target",
    status: "pending",
    notes: "Target version. Upgrade runners to a matching minor version afterwards.",
    checklist: [
      ...stopChecklist("18.5.2", 0),
      { id: "18.5.2-runners", label: "Roll runners forward to 18.5.x", done: false },
      { id: "18.5.2-announce", label: "Announce completion to engineering", done: false },
    ],
  },
]

export const preUpgradeChecks = [
  { id: "pre-disk", label: "At least 30% free disk on the data volume", done: true },
  { id: "pre-pg", label: "PostgreSQL version supported by the target release", done: true },
  { id: "pre-deprecations", label: "Review deprecations and breaking changes", done: true },
  { id: "pre-staging", label: "Rehearse the full path on staging", done: false },
  { id: "pre-notice", label: "Send maintenance notice to all users", done: false },
]
