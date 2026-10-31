import { MOCK_NOW, addMinutes, intBetween, mulberry32, pick } from "./core"
import { activeProjects } from "./projects"
import { runners } from "./runners"
import { users, type MockUser } from "./users"

export type AuditType = "auth" | "project" | "member" | "runner" | "settings" | "token"

export const AUDIT_TYPE_LABELS: Record<AuditType, string> = {
  auth: "인증",
  project: "프로젝트",
  member: "멤버",
  runner: "러너",
  settings: "설정",
  token: "토큰",
}

export type AuditEvent = {
  id: number
  at: string
  actor: MockUser
  type: AuditType
  action: string
  target: string
  ip: string
  result: "success" | "failed"
}

type Template = { type: AuditType; action: string; target: (r: () => number) => string; failRate?: number }

const TEMPLATES: Template[] = [
  { type: "auth", action: "로그인", target: () => "웹 (비밀번호 + 2FA)", failRate: 0.12 },
  { type: "auth", action: "로그인", target: () => "SSO (OIDC)", failRate: 0.06 },
  { type: "auth", action: "2FA 활성화", target: () => "TOTP" },
  { type: "project", action: "프로젝트 생성", target: (r) => `${pick(r, activeProjects).group}/sandbox-${intBetween(r, 10, 99)}` },
  { type: "project", action: "브랜치 보호 규칙 변경", target: (r) => `${pick(r, activeProjects).path} · main` },
  { type: "project", action: "가시성 변경", target: (r) => `${pick(r, activeProjects).path} → internal` },
  { type: "project", action: "프로젝트 아카이브", target: () => "backend/legacy-admin" },
  { type: "member", action: "멤버 추가", target: (r) => `${pick(r, activeProjects).path} · Developer` },
  { type: "member", action: "권한 변경", target: (r) => `${pick(r, activeProjects).path} · Developer → Maintainer` },
  { type: "member", action: "멤버 제거", target: (r) => `${pick(r, activeProjects).group} 그룹` },
  { type: "runner", action: "러너 등록", target: (r) => pick(r, runners).name },
  { type: "runner", action: "러너 일시중지", target: () => "deploy-prod" },
  { type: "runner", action: "러너 토큰 재발급", target: (r) => pick(r, runners).name },
  { type: "settings", action: "그룹 설정 변경", target: () => "platform · MR 승인 규칙" },
  { type: "settings", action: "CI/CD 변수 수정", target: (r) => `${pick(r, activeProjects).path} · AWS_REGION` },
  { type: "settings", action: "배포 키 추가", target: (r) => pick(r, activeProjects).path },
  { type: "token", action: "개인 액세스 토큰 발급", target: () => "scope: api, read_repository" },
  { type: "token", action: "개인 액세스 토큰 폐기", target: () => "만료 예정 토큰" },
  { type: "token", action: "프로젝트 액세스 토큰 발급", target: (r) => `${pick(r, activeProjects).path} · read_api` },
]

const IPS = ["10.0.12.", "10.0.14.", "172.16.8.", "203.0.113.", "198.51.100."]

export const auditEvents: AuditEvent[] = (() => {
  const rand = mulberry32(7777)
  const actors = users.filter((u) => u.status === "active")
  return Array.from({ length: 64 }, (_, i) => {
    const t = pick(rand, TEMPLATES)
    const failed = rand() < (t.failRate ?? 0.01)
    return {
      id: 90210 - i,
      at: addMinutes(MOCK_NOW, -(i * 23 + intBetween(rand, 0, 18))),
      actor: pick(rand, actors),
      type: t.type,
      action: t.action,
      target: t.target(rand),
      ip: `${pick(rand, IPS)}${intBetween(rand, 2, 250)}`,
      result: failed ? "failed" : "success",
    }
  })
})()

export const auditTypeCounts = (Object.keys(AUDIT_TYPE_LABELS) as AuditType[]).map((type) => ({
  type,
  label: AUDIT_TYPE_LABELS[type],
  count: auditEvents.filter((e) => e.type === type).length,
}))

export const failedLogins24h = auditEvents.filter((e) => e.type === "auth" && e.result === "failed").length
