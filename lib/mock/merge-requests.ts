import { MOCK_NOW, WEEK_STARTS, addMinutes, intBetween, mulberry32, pick } from "./core"
import { committers, type MockUser } from "./users"

export type MRState = "open" | "draft" | "approved" | "changes_requested"
export type PipelineState = "success" | "failed" | "running" | "pending" | "canceled"
export type MRLabel = "feature" | "bug" | "chore" | "security" | "docs" | "performance" | "breaking"

export type MergeRequest = {
  iid: number
  title: string
  project: string
  author: MockUser
  reviewers: MockUser[]
  state: MRState
  pipeline: PipelineState
  labels: MRLabel[]
  createdAt: string
  updatedAt: string
  additions: number
  deletions: number
  filesChanged: number
  approvals: number
  approvalsRequired: number
  unresolvedThreads: number
  sourceBranch: string
}

const TITLES: [string, string, MRLabel[]][] = [
  ["feat(auth): WebAuthn 패스키 로그인", "auth-service", ["feature", "security"]],
  ["fix(orders): 부분 취소 시 쿠폰 환급 금액 오류", "order-service", ["bug"]],
  ["chore: ESLint flat config 전환", "web-console", ["chore"]],
  ["perf(gateway): 커넥션 풀 재사용으로 p99 18% 단축", "gateway-api", ["performance"]],
  ["feat(payment): 간편결제 정산 리포트 API", "payment-service", ["feature"]],
  ["fix(etl): 타임존 변환으로 일자 경계 레코드 중복", "etl-pipelines", ["bug"]],
  ["docs: 러너 등록 절차 문서화", "ci-templates", ["docs"]],
  ["feat(ui): Combobox 컴포넌트 추가", "design-system", ["feature"]],
  ["security: 의존성 취약점 패치 (lodash, axios)", "web-console", ["security", "chore"]],
  ["refactor(search): 토크나이저 모듈 분리", "search-indexer", ["chore"]],
  ["feat(ios): 위젯에서 주문 상태 표시", "ios-app", ["feature"]],
  ["fix(android): 백그라운드 복귀 시 세션 만료 처리", "android-app", ["bug"]],
  ["infra: RDS 스토리지 자동 확장 활성화", "infra-terraform", ["chore"]],
  ["feat(notify): 카카오 알림톡 템플릿 v2", "notification-worker", ["feature"]],
  ["fix(feature-store): 피처 TTL 만료 캐시 미갱신", "feature-store", ["bug"]],
  ["breaking(gateway): v1 라우트 제거", "gateway-api", ["breaking"]],
  ["chore(k8s): HPA 지표를 커스텀 메트릭으로 교체", "k8s-manifests", ["chore"]],
  ["feat(dashboards): 결제 전환율 대시보드", "analytics-dashboards", ["feature"]],
  ["perf(order): 재고 조회 N+1 제거", "order-service", ["performance"]],
  ["fix(monitoring): 알림 중복 발송 억제", "monitoring-stack", ["bug"]],
  ["feat(marketing): 채용 페이지 리뉴얼", "marketing-site", ["feature"]],
  ["security: 컨테이너 베이스 이미지 distroless 전환", "ci-templates", ["security"]],
  ["docs(api): OpenAPI 스펙 3.1 업데이트", "gateway-api", ["docs"]],
  ["fix(web): 테이블 정렬 상태가 새로고침 시 초기화", "web-console", ["bug"]],
  ["feat(payment): 해외 카드 3DS 2.0", "payment-service", ["feature", "security"]],
  ["chore(deps): Kotlin 2.2, Compose 1.9", "android-app", ["chore"]],
]

export const mergeRequests: MergeRequest[] = (() => {
  const rand = mulberry32(404)
  return TITLES.map(([title, project, labels], i) => {
    const ageHours = i < 3 ? intBetween(rand, 2, 20) : intBetween(rand, 6, 520)
    const createdAt = addMinutes(MOCK_NOW, -ageHours * 60)
    const updatedAt = addMinutes(MOCK_NOW, -intBetween(rand, 5, Math.max(6, ageHours * 20)))
    const author = pick(rand, committers)
    const reviewerPool = committers.filter((u) => u.id !== author.id)
    const reviewers = [pick(rand, reviewerPool), pick(rand, reviewerPool)].filter(
      (r, idx, arr) => arr.findIndex((x) => x.id === r.id) === idx
    )
    const state: MRState =
      i % 7 === 2 ? "draft" : i % 5 === 1 ? "approved" : i % 6 === 4 ? "changes_requested" : "open"
    const approvalsRequired = labels.includes("security") || labels.includes("breaking") ? 2 : 1
    const approvals = state === "approved" ? approvalsRequired : state === "open" && rand() < 0.4 ? 1 : 0
    const pipeline: PipelineState =
      i === 1 ? "failed" : i === 0 ? "running" : state === "draft" ? "pending" : rand() < 0.88 ? "success" : "failed"
    return {
      iid: 1480 - i * 3 - intBetween(rand, 0, 2),
      title,
      project,
      author,
      reviewers,
      state,
      pipeline,
      labels,
      createdAt,
      updatedAt,
      additions: intBetween(rand, 12, 1400),
      deletions: intBetween(rand, 0, 600),
      filesChanged: intBetween(rand, 1, 42),
      approvals,
      approvalsRequired,
      unresolvedThreads: state === "changes_requested" ? intBetween(rand, 2, 7) : intBetween(rand, 0, 2),
      sourceBranch: `${labels[0] === "bug" ? "fix" : labels[0] === "feature" ? "feat" : "chore"}/${project.split("-")[0]}-${1480 - i * 3}`,
    }
  })
})()

export const openMRs = mergeRequests
export const draftMRs = mergeRequests.filter((m) => m.state === "draft")
export const approvedMRs = mergeRequests.filter((m) => m.state === "approved")

export function mrAgeHours(mr: MergeRequest) {
  return Math.round((Date.parse(`${MOCK_NOW}Z`) - Date.parse(`${mr.createdAt}Z`)) / 3600000)
}

export const staleMRs = mergeRequests
  .filter((m) => mrAgeHours(m) > 24 * 10)
  .sort((a, b) => mrAgeHours(b) - mrAgeHours(a))

/** MRs opened / merged / closed per week for the last 12 weeks */
export const weeklyThroughput = (() => {
  const rand = mulberry32(21)
  return WEEK_STARTS.map((weekStart, w) => {
    const opened = intBetween(rand, 34, 62) + (w === 11 ? -14 : 0)
    const merged = Math.round(opened * (0.78 + rand() * 0.18)) + (w === 11 ? -4 : 0)
    const closed = intBetween(rand, 1, 7)
    return { weekStart, opened, merged, closed }
  })
})()

/** median / p90 hours from open to merge, per week */
export const timeToMerge = (() => {
  const rand = mulberry32(55)
  return WEEK_STARTS.map((weekStart, w) => {
    const p50 = Math.round((20 - w * 0.6 + rand() * 6) * 10) / 10
    const p90 = Math.round((p50 * (2.6 + rand() * 0.8)) * 10) / 10
    return { weekStart, p50, p90 }
  })
})()

export const mergedThisWeek = weeklyThroughput[11].merged
export const mergedLastWeek = weeklyThroughput[10].merged
export const medianTimeToMergeHours = timeToMerge[11].p50
export const firstReviewHours = 3.4

export const reviewerLoad = (() => {
  const map = new Map<number, { user: MockUser; pending: number; done30d: number }>()
  for (const mr of mergeRequests) {
    for (const r of mr.reviewers) {
      const entry = map.get(r.id) ?? { user: r, pending: 0, done30d: r.reviews30d }
      if (mr.state !== "approved" && mr.state !== "draft") entry.pending += 1
      map.set(r.id, entry)
    }
  }
  return [...map.values()].sort((a, b) => b.pending - a.pending || b.done30d - a.done30d).slice(0, 8)
})()

export const labelCounts = (["feature", "bug", "chore", "security", "performance", "docs", "breaking"] as MRLabel[]).map(
  (label) => ({ label, count: mergeRequests.filter((m) => m.labels.includes(label)).length })
)
