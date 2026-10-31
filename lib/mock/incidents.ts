import { MONTHS } from "./core"
import { userById, type MockUser } from "./users"

export type IncidentSeverity = "S1" | "S2" | "S3" | "S4"
export type IncidentStatus = "open" | "mitigated" | "resolved"

export type Incident = {
  id: string
  title: string
  severity: IncidentSeverity
  status: IncidentStatus
  service: string
  startedAt: string
  resolvedAt: string | null
  durationMin: number
  owner: MockUser
  impact: string
  rootCause?: string
}

export const SEVERITY_DESC: Record<IncidentSeverity, string> = {
  S1: "전면 장애",
  S2: "주요 기능 저하",
  S3: "부분 영향",
  S4: "경미",
}

const RAW: (Omit<Incident, "owner" | "durationMin"> & { ownerId?: number })[] = [
  { id: "INC-241", title: "결제 승인 API 5xx 급증", severity: "S1", status: "mitigated", service: "payment-service", startedAt: "2026-10-31T08:41:00", resolvedAt: null, impact: "결제 요청의 약 12% 실패", ownerId: 1012 },
  { id: "INC-240", title: "Gitaly 데이터 볼륨 사용률 91%", severity: "S2", status: "open", service: "gitlab-gitaly", startedAt: "2026-10-30T23:10:00", resolvedAt: null, impact: "대용량 푸시 지연 가능", ownerId: 1007 },
  { id: "INC-239", title: "러너 풀 고갈로 파이프라인 대기 증가", severity: "S3", status: "resolved", service: "ci-runners", startedAt: "2026-10-29T14:02:00", resolvedAt: "2026-10-29T15:37:00", impact: "평균 대기 시간 38초 → 11분", rootCause: "k8s-autoscale-b 노드 그룹 상한 도달", ownerId: 1024 },
  { id: "INC-238", title: "SSO 로그인 간헐 실패", severity: "S2", status: "resolved", service: "auth-service", startedAt: "2026-10-27T09:12:00", resolvedAt: "2026-10-27T10:05:00", impact: "로그인 시도의 7% 실패", rootCause: "IdP 인증서 갱신 후 캐시 미갱신", ownerId: 1030 },
  { id: "INC-237", title: "컨테이너 레지스트리 GC 지연", severity: "S4", status: "resolved", service: "gitlab-registry", startedAt: "2026-10-24T02:00:00", resolvedAt: "2026-10-24T06:20:00", impact: "스토리지 회수 지연", rootCause: "GC 잡 타임아웃 설정 과소", ownerId: 1002 },
  { id: "INC-236", title: "주문 DB 커넥션 풀 포화", severity: "S1", status: "resolved", service: "order-service", startedAt: "2026-10-19T11:48:00", resolvedAt: "2026-10-19T12:31:00", impact: "주문 생성 전면 실패 43분", rootCause: "배치 잡이 트랜잭션을 장시간 점유", ownerId: 1012 },
  { id: "INC-235", title: "CDN 캐시 무효화 실패", severity: "S3", status: "resolved", service: "marketing-site", startedAt: "2026-10-15T16:20:00", resolvedAt: "2026-10-15T17:02:00", impact: "구버전 페이지 노출", rootCause: "API 토큰 만료", ownerId: 1007 },
  { id: "INC-234", title: "검색 인덱서 2시간 지연", severity: "S3", status: "resolved", service: "search-indexer", startedAt: "2026-10-11T07:30:00", resolvedAt: "2026-10-11T10:10:00", impact: "신규 상품 검색 노출 지연", rootCause: "Kafka 파티션 리밸런싱 반복", ownerId: 1024 },
  { id: "INC-233", title: "GitLab 웹 응답 지연 (p95 4초)", severity: "S2", status: "resolved", service: "gitlab-web", startedAt: "2026-10-06T13:05:00", resolvedAt: "2026-10-06T14:40:00", impact: "MR 페이지 로딩 지연", rootCause: "Sidekiq 큐 적체로 DB 부하 증가", ownerId: 1002 },
  { id: "INC-232", title: "알림 워커 메시지 중복 발송", severity: "S4", status: "resolved", service: "notification-worker", startedAt: "2026-09-28T19:00:00", resolvedAt: "2026-09-28T19:50:00", impact: "일부 사용자에게 푸시 2회 발송", rootCause: "재시도 멱등키 누락", ownerId: 1030 },
  { id: "INC-231", title: "iOS 빌드 러너 전원 오프라인", severity: "S3", status: "resolved", service: "ci-runners", startedAt: "2026-09-22T09:00:00", resolvedAt: "2026-09-22T13:15:00", impact: "iOS 릴리스 빌드 중단", rootCause: "macOS 업데이트 후 러너 서비스 미기동", ownerId: 1024 },
  { id: "INC-230", title: "결제 정산 배치 실패", severity: "S2", status: "resolved", service: "payment-service", startedAt: "2026-09-14T03:00:00", resolvedAt: "2026-09-14T05:45:00", impact: "전일 정산 리포트 지연", rootCause: "PG 응답 포맷 변경", ownerId: 1012 },
  { id: "INC-229", title: "오브젝트 스토리지 429 응답", severity: "S3", status: "resolved", service: "gitlab-artifacts", startedAt: "2026-08-30T10:20:00", resolvedAt: "2026-08-30T11:00:00", impact: "아티팩트 업로드 간헐 실패", rootCause: "버킷 요청 한도 초과", ownerId: 1007 },
  { id: "INC-228", title: "피처 스토어 서빙 지연", severity: "S4", status: "resolved", service: "feature-store", startedAt: "2026-08-18T15:10:00", resolvedAt: "2026-08-18T15:48:00", impact: "추천 응답 p95 증가", rootCause: "Redis 메모리 정책 변경", ownerId: 1030 },
]

function durationMinutes(startedAt: string, resolvedAt: string | null) {
  const end = resolvedAt ?? "2026-10-31T10:12:00"
  return Math.round((Date.parse(`${end}Z`) - Date.parse(`${startedAt}Z`)) / 60000)
}

export const incidents: Incident[] = RAW.map(({ ownerId, ...r }) => ({
  ...r,
  owner: userById(ownerId ?? 1002),
  durationMin: durationMinutes(r.startedAt, r.resolvedAt),
}))

export const openIncidents = incidents.filter((i) => i.status !== "resolved")

export const monthlyIncidentStats = MONTHS.map((month) => {
  const rows = incidents.filter((i) => i.startedAt.startsWith(month) && i.status === "resolved")
  const extra: Record<string, { count: number; mttr: number }> = {
    "2026-05": { count: 4, mttr: 96 },
    "2026-06": { count: 3, mttr: 142 },
    "2026-07": { count: 5, mttr: 88 },
  }
  if (extra[month]) return { month, ...extra[month] }
  const mttr = rows.length ? Math.round(rows.reduce((s, r) => s + r.durationMin, 0) / rows.length) : 0
  return { month, count: rows.length + (month === "2026-08" ? 1 : 0), mttr: mttr || 52 }
})

export const mttrThisMonth = monthlyIncidentStats[5].mttr
export const mttrLastMonth = monthlyIncidentStats[4].mttr

export const serviceUptime = [
  { service: "gitlab-web", uptime: 99.94, incidents90d: 1 },
  { service: "gitlab-gitaly", uptime: 99.98, incidents90d: 1 },
  { service: "ci-runners", uptime: 99.71, incidents90d: 2 },
  { service: "gitlab-registry", uptime: 99.9, incidents90d: 1 },
  { service: "auth-service", uptime: 99.88, incidents90d: 1 },
  { service: "payment-service", uptime: 99.62, incidents90d: 2 },
  { service: "order-service", uptime: 99.85, incidents90d: 1 },
  { service: "search-indexer", uptime: 99.93, incidents90d: 1 },
]

export const onCall = {
  primary: userById(1024),
  secondary: userById(1007),
  rotation: "SRE 주간 로테이션 (월 10:00 교대)",
}

export const severityCounts90d = (["S1", "S2", "S3", "S4"] as IncidentSeverity[]).map((severity) => ({
  severity,
  count: incidents.filter((i) => i.severity === severity).length,
}))
