import {
  MOCK_TODAY,
  addDays,
  clamp,
  hashString,
  intBetween,
  mulberry32,
  pick,
} from "./core"

export type UserRole = "Owner" | "Maintainer" | "Developer" | "Reporter" | "Guest"
export type UserStatus = "active" | "blocked" | "deactivated" | "pending"

export type MockUser = {
  id: number
  name: string
  username: string
  email: string
  department: string
  title: string
  role: UserRole
  status: UserStatus
  isAdmin: boolean
  twoFactor: boolean
  joinedAt: string
  leftAt: string | null
  lastActivity: string | null
  /** hue (0-360) used for the avatar color */
  hue: number
  projects: number
  /** commits per week for the last 12 weeks, oldest first (index 11 = this week) */
  weeklyCommits: number[]
  additions30d: number
  deletions30d: number
  mrsMerged30d: number
  reviews30d: number
  streakDays: number
}

const FIRST: [string, string][] = [
  ["민준", "minjun"], ["서연", "seoyeon"], ["지호", "jiho"], ["하윤", "hayoon"],
  ["도윤", "doyun"], ["지우", "jiwoo"], ["은우", "eunwoo"], ["수아", "sua"],
  ["시우", "siwoo"], ["지아", "jia"], ["준서", "junseo"], ["예린", "yerin"],
  ["현우", "hyunwoo"], ["채원", "chaewon"], ["태양", "taeyang"], ["유나", "yuna"],
  ["건우", "gunwoo"], ["다혜", "dahye"], ["준호", "junho"], ["소희", "sohee"],
  ["민규", "mingyu"], ["나리", "nari"], ["우진", "woojin"], ["보라", "bora"],
  ["재현", "jaehyun"], ["유진", "yujin"], ["성민", "sungmin"], ["지민", "jimin"],
  ["동현", "donghyun"], ["하은", "haeun"], ["승우", "seungwoo"], ["서현", "seohyun"],
  ["지훈", "jihoon"], ["가은", "gaeun"], ["현서", "hyunseo"], ["수빈", "subin"],
  ["영준", "youngjun"], ["지원", "jiwon"], ["태민", "taemin"], ["혜원", "hyewon"],
]
const LAST: [string, string][] = [
  ["김", "kim"], ["이", "lee"], ["박", "park"], ["최", "choi"], ["정", "jung"],
  ["강", "kang"], ["조", "cho"], ["윤", "yoon"], ["장", "jang"], ["임", "lim"],
  ["한", "han"], ["오", "oh"], ["서", "seo"], ["신", "shin"], ["권", "kwon"],
]

export const DEPARTMENTS = [
  "플랫폼", "백엔드", "프론트엔드", "데이터", "모바일", "QA", "보안", "SRE", "DevOps",
] as const

const TITLES: Record<string, string[]> = {
  플랫폼: ["플랫폼 엔지니어", "시니어 플랫폼 엔지니어", "테크 리드"],
  백엔드: ["백엔드 엔지니어", "시니어 백엔드 엔지니어", "테크 리드"],
  프론트엔드: ["프론트엔드 엔지니어", "시니어 프론트엔드 엔지니어", "UI 엔지니어"],
  데이터: ["데이터 엔지니어", "ML 엔지니어", "데이터 플랫폼 엔지니어"],
  모바일: ["iOS 엔지니어", "Android 엔지니어", "모바일 테크 리드"],
  QA: ["QA 엔지니어", "테스트 자동화 엔지니어"],
  보안: ["보안 엔지니어", "AppSec 엔지니어"],
  SRE: ["SRE", "시니어 SRE"],
  DevOps: ["DevOps 엔지니어", "릴리스 엔지니어"],
}

const ROLE_POOL: UserRole[] = [
  "Developer", "Developer", "Developer", "Developer", "Developer",
  "Maintainer", "Maintainer", "Reporter", "Guest", "Owner",
]

function buildUsers(): MockUser[] {
  const rand = mulberry32(2026)
  const users: MockUser[] = []

  for (let i = 0; i < 56; i++) {
    const [first, firstRoman] = FIRST[i % FIRST.length]
    const [last, lastRoman] = pick(rand, LAST)
    const name = `${last}${first}`
    const username = `${firstRoman}.${lastRoman}${i >= FIRST.length ? i : ""}`
    const department = pick(rand, DEPARTMENTS)
    const role = pick(rand, ROLE_POOL)
    const joinedAt = addDays(MOCK_TODAY, -intBetween(rand, 40, 1400))

    let status: UserStatus = "active"
    let leftAt: string | null = null
    if (i % 11 === 5) {
      status = "deactivated"
      leftAt = addDays(MOCK_TODAY, -intBetween(rand, 1, 28))
    } else if (i % 17 === 9) {
      status = "blocked"
    } else if (i % 19 === 13) {
      status = "pending"
    }

    const isDev = role === "Developer" || role === "Maintainer" || role === "Owner"
    const velocity = isDev && status === "active" ? intBetween(rand, 3, 26) : 0
    const weeklyCommits = Array.from({ length: 12 }, (_, w) => {
      if (velocity === 0) return 0
      const wobble = 0.6 + rand() * 0.9
      const trend = 1 + (w - 6) * 0.015
      return Math.max(0, Math.round(velocity * wobble * trend))
    })
    if (status === "deactivated") {
      weeklyCommits.fill(0, 9)
    }

    const commits30d = weeklyCommits.slice(8).reduce((a, b) => a + b, 0)
    const lastActivity =
      status === "deactivated"
        ? leftAt
        : status === "pending"
          ? null
          : addDays(MOCK_TODAY, -(velocity > 0 ? intBetween(rand, 0, 3) : intBetween(rand, 2, 30)))

    users.push({
      id: 1000 + i,
      name,
      username,
      email: `${username}@example.com`,
      department,
      title: pick(rand, TITLES[department]),
      role,
      status,
      isAdmin: role === "Owner" || (role === "Maintainer" && i % 7 === 0),
      twoFactor: status === "pending" ? false : rand() < 0.82,
      joinedAt,
      leftAt,
      lastActivity,
      hue: hashString(username) % 360,
      projects: isDev ? intBetween(rand, 2, 11) : intBetween(rand, 1, 4),
      weeklyCommits,
      additions30d: Math.round(commits30d * (40 + rand() * 180)),
      deletions30d: Math.round(commits30d * (15 + rand() * 90)),
      mrsMerged30d: Math.round(commits30d / (2.5 + rand() * 2)),
      reviews30d: isDev ? intBetween(rand, 0, 28) : 0,
      streakDays: velocity > 0 ? intBetween(rand, 0, 23) : 0,
    })
  }

  // recent joiners, spread across the last 30 days
  const joinerIdx = [3, 11, 18, 26, 33, 41, 49]
  joinerIdx.forEach((idx, n) => {
    const u = users[idx]
    if (u.status === "active" || u.status === "pending") {
      u.joinedAt = addDays(MOCK_TODAY, -(n * 4 + 1))
      u.weeklyCommits = u.weeklyCommits.map((c, w) => (w < 12 - Math.ceil((n * 4 + 1) / 7) ? 0 : Math.round(c * 0.6)))
      u.streakDays = Math.min(u.streakDays, n * 4 + 1)
    }
  })

  // make the weekly podium unambiguous and the story readable
  const podium: [number, number, number][] = [
    [12, 47, 41], // this week, last week
    [7, 39, 44],
    [24, 36, 22],
    [30, 31, 29],
    [2, 28, 35],
  ]
  podium.forEach(([idx, thisWeek, lastWeek]) => {
    const u = users[idx]
    u.status = "active"
    u.leftAt = null
    u.role = u.role === "Reporter" || u.role === "Guest" ? "Developer" : u.role
    u.weeklyCommits[11] = thisWeek
    u.weeklyCommits[10] = lastWeek
    u.lastActivity = MOCK_TODAY
    u.streakDays = Math.max(u.streakDays, 9)
  })

  return users.map((u) => ({
    ...u,
    streakDays: clamp(u.streakDays, 0, 60),
  }))
}

export const users: MockUser[] = buildUsers()

export const USER_CHANGE_WINDOW_DAYS = 30

export const joiners = users
  .filter((u) => u.joinedAt >= addDays(MOCK_TODAY, -USER_CHANGE_WINDOW_DAYS))
  .sort((a, b) => b.joinedAt.localeCompare(a.joinedAt))

export const leavers = users
  .filter((u) => u.leftAt !== null && u.leftAt >= addDays(MOCK_TODAY, -USER_CHANGE_WINDOW_DAYS))
  .sort((a, b) => (b.leftAt ?? "").localeCompare(a.leftAt ?? ""))

export const activeUsers = users.filter((u) => u.status === "active")

export function userById(id: number) {
  return users.find((u) => u.id === id) ?? users[0]
}

/** Users who commit; used by leaderboards and as authors across the data set. */
export const committers = users
  .filter((u) => u.status === "active" && u.weeklyCommits.some((c) => c > 0))
  .sort((a, b) => a.id - b.id)

export const roleCounts = (["Owner", "Maintainer", "Developer", "Reporter", "Guest"] as UserRole[]).map(
  (role) => ({ role, count: users.filter((u) => u.role === role).length })
)

export const departmentCounts = DEPARTMENTS.map((department) => ({
  department,
  count: users.filter((u) => u.department === department && u.status !== "deactivated").length,
})).sort((a, b) => b.count - a.count)

export const twoFactorRate =
  (users.filter((u) => u.status !== "deactivated" && u.twoFactor).length /
    users.filter((u) => u.status !== "deactivated").length) *
  100
