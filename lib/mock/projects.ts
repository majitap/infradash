import { MOCK_TODAY, addDays, intBetween, mulberry32 } from "./core"
import { committers } from "./users"

export type Language =
  | "TypeScript"
  | "Go"
  | "Python"
  | "Java"
  | "Kotlin"
  | "Swift"
  | "Rust"
  | "HCL"
  | "YAML"

export type Visibility = "private" | "internal" | "public"

export type StorageBreakdown = {
  repository: number
  lfs: number
  artifacts: number
  packages: number
  registry: number
  wiki: number
  uploads: number
}

export type MockProject = {
  id: number
  name: string
  group: string
  path: string
  description: string
  language: Language
  visibility: Visibility
  stars: number
  forks: number
  openMRs: number
  openIssues: number
  defaultBranch: string
  lastActivityAt: string
  pipelineSuccess30d: number
  avgPipelineMinutes: number
  commits30d: number
  weeklyCommits: number[]
  /** all values in MB */
  storage: StorageBreakdown
  vulnerabilities: { critical: number; high: number; medium: number; low: number }
  maintainerIds: number[]
  topics: string[]
  archived: boolean
}

type Seed = Pick<MockProject, "name" | "group" | "description" | "language" | "visibility" | "topics"> & {
  size: "s" | "m" | "l" | "xl"
}

const SEEDS: Seed[] = [
  { name: "gateway-api", group: "platform", description: "엣지 API 게이트웨이와 라우팅 규칙", language: "Go", visibility: "internal", topics: ["gateway", "go"], size: "l" },
  { name: "auth-service", group: "platform", description: "SSO/OIDC 인증과 세션 관리", language: "Go", visibility: "private", topics: ["auth", "oidc"], size: "m" },
  { name: "infra-terraform", group: "platform", description: "클라우드 인프라 IaC (AWS, GCP)", language: "HCL", visibility: "private", topics: ["terraform", "iac"], size: "m" },
  { name: "k8s-manifests", group: "platform", description: "쿠버네티스 배포 매니페스트와 Helm 차트", language: "YAML", visibility: "private", topics: ["kubernetes", "helm"], size: "s" },
  { name: "order-service", group: "backend", description: "주문 생성, 취소, 재고 연동", language: "Java", visibility: "private", topics: ["spring", "orders"], size: "xl" },
  { name: "payment-service", group: "backend", description: "결제 승인, 정산, PG 연동", language: "Kotlin", visibility: "private", topics: ["payments", "kotlin"], size: "l" },
  { name: "notification-worker", group: "backend", description: "푸시/이메일/SMS 알림 발송 워커", language: "Python", visibility: "internal", topics: ["worker", "celery"], size: "s" },
  { name: "search-indexer", group: "backend", description: "검색 인덱싱 파이프라인", language: "Rust", visibility: "internal", topics: ["search", "rust"], size: "m" },
  { name: "web-console", group: "frontend", description: "운영 콘솔 웹 애플리케이션", language: "TypeScript", visibility: "private", topics: ["nextjs", "react"], size: "xl" },
  { name: "design-system", group: "frontend", description: "공용 UI 컴포넌트와 디자인 토큰", language: "TypeScript", visibility: "public", topics: ["ui", "storybook"], size: "m" },
  { name: "marketing-site", group: "frontend", description: "마케팅 사이트와 랜딩 페이지", language: "TypeScript", visibility: "public", topics: ["astro", "cms"], size: "s" },
  { name: "etl-pipelines", group: "data", description: "배치 ETL과 데이터 웨어하우스 적재", language: "Python", visibility: "private", topics: ["airflow", "etl"], size: "l" },
  { name: "feature-store", group: "data", description: "ML 피처 스토어와 서빙 API", language: "Python", visibility: "private", topics: ["ml", "features"], size: "m" },
  { name: "analytics-dashboards", group: "data", description: "사내 분석 대시보드", language: "TypeScript", visibility: "internal", topics: ["dashboards", "sql"], size: "s" },
  { name: "ios-app", group: "mobile", description: "iOS 고객 앱", language: "Swift", visibility: "private", topics: ["ios", "swift"], size: "l" },
  { name: "android-app", group: "mobile", description: "Android 고객 앱", language: "Kotlin", visibility: "private", topics: ["android", "compose"], size: "l" },
  { name: "ci-templates", group: "infra", description: "공용 CI/CD 템플릿과 재사용 잡", language: "YAML", visibility: "internal", topics: ["ci", "templates"], size: "s" },
  { name: "monitoring-stack", group: "infra", description: "모니터링, 알림, 대시보드 구성", language: "Go", visibility: "internal", topics: ["prometheus", "grafana"], size: "m" },
  { name: "legacy-admin", group: "backend", description: "구 관리자 포털 (아카이브됨)", language: "Java", visibility: "private", topics: ["legacy"], size: "m" },
]

const SIZE_FACTOR = { s: 0.5, m: 1, l: 1.8, xl: 3 } as const

function buildProjects(): MockProject[] {
  const rand = mulberry32(77)
  return SEEDS.map((seed, i) => {
    const f = SIZE_FACTOR[seed.size]
    const archived = seed.name === "legacy-admin"
    const weeklyCommits = Array.from({ length: 12 }, (_, w) =>
      archived ? 0 : Math.max(0, Math.round((10 + rand() * 24) * f * (1 + (w - 6) * 0.02)))
    )
    const commits30d = weeklyCommits.slice(8).reduce((a, b) => a + b, 0)
    const repoMb = Math.round((120 + rand() * 900) * f)
    const maintainerPool = committers.filter((_, idx) => idx % 3 === i % 3)
    const maintainerIds = [maintainerPool[i % maintainerPool.length].id, maintainerPool[(i + 5) % maintainerPool.length].id]

    const success = archived ? 0 : Math.round((86 + rand() * 13.5) * 10) / 10

    return {
      id: 200 + i,
      name: seed.name,
      group: seed.group,
      path: `${seed.group}/${seed.name}`,
      description: seed.description,
      language: seed.language,
      visibility: seed.visibility,
      stars: intBetween(rand, 2, 60) + (seed.visibility === "public" ? 80 : 0),
      forks: intBetween(rand, 0, 14),
      openMRs: archived ? 0 : intBetween(rand, 1, 9),
      openIssues: archived ? 3 : intBetween(rand, 4, 48),
      defaultBranch: "main",
      lastActivityAt: archived ? addDays(MOCK_TODAY, -210) : addDays(MOCK_TODAY, intBetween(rand, 0, 4) * -1),
      pipelineSuccess30d: success,
      avgPipelineMinutes: Math.round((3 + rand() * 14) * f * 10) / 10,
      commits30d,
      weeklyCommits,
      storage: {
        repository: repoMb,
        lfs: seed.language === "Swift" || seed.language === "Kotlin" ? Math.round(repoMb * 1.4) : Math.round(repoMb * 0.1),
        artifacts: Math.round((1800 + rand() * 15000) * f),
        packages: seed.language === "TypeScript" || seed.language === "Java" ? Math.round((600 + rand() * 2400) * f) : Math.round(rand() * 300),
        registry: seed.language === "HCL" || seed.language === "YAML" ? 0 : Math.round((2000 + rand() * 16000) * f),
        wiki: Math.round(rand() * 40),
        uploads: Math.round(rand() * 120),
      },
      vulnerabilities: archived
        ? { critical: 2, high: 5, medium: 7, low: 4 }
        : {
            critical: rand() < 0.25 ? intBetween(rand, 1, 2) : 0,
            high: intBetween(rand, 0, 4),
            medium: intBetween(rand, 1, 9),
            low: intBetween(rand, 2, 14),
          },
      maintainerIds,
      topics: seed.topics,
      archived,
    }
  })
}

export const projects: MockProject[] = buildProjects()

export const activeProjects = projects.filter((p) => !p.archived)

export function projectById(id: number) {
  return projects.find((p) => p.id === id) ?? projects[0]
}

export function projectByName(name: string) {
  return projects.find((p) => p.name === name) ?? projects[0]
}

export const LANGUAGE_GROUPS: { label: string; match: Language[] }[] = [
  { label: "TypeScript", match: ["TypeScript"] },
  { label: "Go", match: ["Go"] },
  { label: "Python", match: ["Python"] },
  { label: "Kotlin", match: ["Kotlin"] },
  { label: "Java", match: ["Java"] },
  { label: "기타", match: ["Swift", "Rust", "HCL", "YAML"] },
]

export const languageDistribution = LANGUAGE_GROUPS.map((g) => ({
  label: g.label,
  count: projects.filter((p) => g.match.includes(p.language)).length,
}))

export const groupCounts = ["platform", "backend", "frontend", "data", "mobile", "infra"].map((group) => ({
  group,
  count: projects.filter((p) => p.group === group).length,
}))

export function totalStorage(p: MockProject) {
  const s = p.storage
  return s.repository + s.lfs + s.artifacts + s.packages + s.registry + s.wiki + s.uploads
}
