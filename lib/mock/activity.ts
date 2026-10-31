import { userById, type MockUser } from "./users"

export type ActivityType =
  | "push"
  | "mr_merged"
  | "mr_opened"
  | "pipeline_failed"
  | "pipeline_passed"
  | "user_joined"
  | "runner_offline"
  | "incident_resolved"
  | "incident_opened"
  | "release"
  | "security"

export type ActivityItem = {
  id: number
  type: ActivityType
  actor: MockUser | null
  text: string
  project?: string
  at: string
}

export const activityFeed: ActivityItem[] = [
  { id: 1, type: "incident_opened", actor: userById(1012), text: "INC-241 결제 승인 API 5xx 급증 (S1) 선언", project: "payment-service", at: "2026-10-31T08:41:00" },
  { id: 2, type: "pipeline_failed", actor: userById(1007), text: "파이프라인 #88405 실패 · test 스테이지", project: "order-service", at: "2026-10-31T09:52:00" },
  { id: 3, type: "mr_merged", actor: userById(1024), text: "!1468 perf(gateway): 커넥션 풀 재사용 머지", project: "gateway-api", at: "2026-10-31T09:31:00" },
  { id: 4, type: "release", actor: userById(1002), text: "v2026.10.4 릴리스 태그 생성", project: "web-console", at: "2026-10-31T09:05:00" },
  { id: 5, type: "security", actor: null, text: "Secret Detection: etl-pipelines에서 AWS 키 탐지", project: "etl-pipelines", at: "2026-10-31T08:12:00" },
  { id: 6, type: "mr_opened", actor: userById(1030), text: "!1480 feat(auth): WebAuthn 패스키 로그인 열림", project: "auth-service", at: "2026-10-31T07:58:00" },
  { id: 7, type: "user_joined", actor: userById(1003), text: "신규 멤버가 platform 그룹에 합류", at: "2026-10-30T18:20:00" },
  { id: 8, type: "runner_offline", actor: null, text: "러너 build-docker-03 오프라인 전환", at: "2026-10-29T22:05:00" },
  { id: 9, type: "incident_resolved", actor: userById(1024), text: "INC-239 러너 풀 고갈 해결 (1시간 35분)", at: "2026-10-29T15:37:00" },
  { id: 10, type: "pipeline_passed", actor: userById(1012), text: "release/2026.10 파이프라인 통과 · 프로덕션 배포 대기", project: "payment-service", at: "2026-10-29T11:14:00" },
  { id: 11, type: "push", actor: userById(1007), text: "main에 4개 커밋 푸시", project: "design-system", at: "2026-10-29T10:02:00" },
  { id: 12, type: "mr_merged", actor: userById(1002), text: "!1455 security: distroless 베이스 이미지 전환 머지", project: "ci-templates", at: "2026-10-28T17:46:00" },
]

export const notifications = [
  { id: 1, title: "S1 인시던트 진행 중", body: "INC-241 결제 승인 API 5xx 급증", at: "2026-10-31T08:41:00", tone: "critical" as const },
  { id: 2, title: "시크릿 탐지", body: "etl-pipelines에서 AWS 액세스 키가 탐지되었습니다", at: "2026-10-31T08:12:00", tone: "warning" as const },
  { id: 3, title: "러너 오프라인", body: "build-docker-03, macos-ios-01, e2e-browser-01", at: "2026-10-29T22:05:00", tone: "warning" as const },
  { id: 4, title: "업그레이드 창 확정", body: "11월 15일 02:00 ~ 06:00 KST", at: "2026-10-28T14:00:00", tone: "info" as const },
]
