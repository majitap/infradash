import { WEEK_STARTS, addDays, MOCK_TODAY, intBetween, mulberry32 } from "./core"
import { projects } from "./projects"

export type Severity = "critical" | "high" | "medium" | "low"
export type Scanner = "SAST" | "DAST" | "Dependency" | "Container" | "Secret" | "IaC"
export type VulnStatus = "detected" | "confirmed" | "dismissed" | "resolved"

export const SEVERITY_LABELS: Record<Severity, string> = {
  critical: "치명",
  high: "높음",
  medium: "중간",
  low: "낮음",
}

export const severityTotals = (["critical", "high", "medium", "low"] as Severity[]).map((severity) => ({
  severity,
  label: SEVERITY_LABELS[severity],
  count: projects.reduce((s, p) => s + p.vulnerabilities[severity], 0),
}))

export const openVulnerabilities = severityTotals.reduce((s, v) => s + v.count, 0)

export const weeklySeverity = (() => {
  const rand = mulberry32(1313)
  const finals = Object.fromEntries(severityTotals.map((s) => [s.severity, s.count])) as Record<Severity, number>
  return WEEK_STARTS.map((weekStart, w) => {
    const ratio = 1.55 - (w / 11) * 0.55
    return {
      weekStart,
      critical: Math.max(0, Math.round(finals.critical * ratio + (rand() - 0.5) * 2)),
      high: Math.max(0, Math.round(finals.high * ratio + (rand() - 0.5) * 4)),
      medium: Math.max(0, Math.round(finals.medium * ratio + (rand() - 0.5) * 6)),
      low: Math.max(0, Math.round(finals.low * ratio + (rand() - 0.5) * 8)),
    }
  }).map((row, w) => (w === 11 ? { ...row, ...finals } : row))
})()

export const byScanner: { scanner: Scanner; count: number }[] = [
  { scanner: "Dependency", count: 61 },
  { scanner: "SAST", count: 38 },
  { scanner: "Container", count: 27 },
  { scanner: "Secret", count: 6 },
  { scanner: "DAST", count: 9 },
  { scanner: "IaC", count: 12 },
]

export type Vulnerability = {
  id: string
  title: string
  severity: Severity
  scanner: Scanner
  project: string
  cve?: string
  status: VulnStatus
  detectedAt: string
  location: string
  fixAvailable: boolean
}

const VULNS: Omit<Vulnerability, "id" | "detectedAt">[] = [
  { title: "하드코딩된 AWS 액세스 키", severity: "critical", scanner: "Secret", project: "etl-pipelines", status: "confirmed", location: "dags/config/s3.py:14", fixAvailable: false },
  { title: "SQL 인젝션 가능성: OrderRepository.search", severity: "critical", scanner: "SAST", project: "order-service", status: "confirmed", location: "OrderRepository.java:188", fixAvailable: false },
  { title: "lodash 프로토타입 오염", severity: "high", scanner: "Dependency", project: "web-console", cve: "CVE-2021-23337", status: "detected", location: "package-lock.json", fixAvailable: true },
  { title: "openssl 베이스 이미지 취약점", severity: "high", scanner: "Container", project: "gateway-api", cve: "CVE-2024-5535", status: "detected", location: "Dockerfile:1", fixAvailable: true },
  { title: "XSS: 검색 파라미터 미이스케이프", severity: "high", scanner: "DAST", project: "web-console", status: "confirmed", location: "/search?q=", fixAvailable: false },
  { title: "S3 버킷 퍼블릭 읽기 허용", severity: "high", scanner: "IaC", project: "infra-terraform", status: "detected", location: "modules/assets/main.tf:42", fixAvailable: false },
  { title: "jackson-databind 역직렬화", severity: "high", scanner: "Dependency", project: "order-service", cve: "CVE-2020-36518", status: "dismissed", location: "pom.xml", fixAvailable: true },
  { title: "axios SSRF", severity: "medium", scanner: "Dependency", project: "design-system", cve: "CVE-2025-27152", status: "detected", location: "package-lock.json", fixAvailable: true },
  { title: "컨테이너가 root로 실행됨", severity: "medium", scanner: "Container", project: "notification-worker", status: "detected", location: "Dockerfile:21", fixAvailable: false },
  { title: "약한 해시 알고리즘 (MD5)", severity: "medium", scanner: "SAST", project: "auth-service", status: "confirmed", location: "internal/token/hash.go:33", fixAvailable: false },
  { title: "RDS 암호화 미설정", severity: "medium", scanner: "IaC", project: "infra-terraform", status: "resolved", location: "modules/db/main.tf:18", fixAvailable: false },
  { title: "pyyaml unsafe load", severity: "medium", scanner: "Dependency", project: "feature-store", cve: "CVE-2020-14343", status: "detected", location: "requirements.txt", fixAvailable: true },
  { title: "Slack 웹훅 URL 노출", severity: "medium", scanner: "Secret", project: "monitoring-stack", status: "resolved", location: "alerts/notify.yaml:7", fixAvailable: false },
  { title: "정보 노출: 스택 트레이스 응답", severity: "low", scanner: "DAST", project: "gateway-api", status: "detected", location: "/v2/orders/{id}", fixAvailable: false },
  { title: "minimatch ReDoS", severity: "low", scanner: "Dependency", project: "marketing-site", cve: "CVE-2022-3517", status: "detected", location: "package-lock.json", fixAvailable: true },
  { title: "HSTS 헤더 누락", severity: "low", scanner: "DAST", project: "marketing-site", status: "detected", location: "/", fixAvailable: false },
  { title: "kotlinx-serialization DoS", severity: "low", scanner: "Dependency", project: "android-app", cve: "CVE-2024-4231", status: "dismissed", location: "build.gradle.kts", fixAvailable: true },
  { title: "Dockerfile에 latest 태그 사용", severity: "low", scanner: "Container", project: "search-indexer", status: "detected", location: "Dockerfile:1", fixAvailable: false },
]

export const vulnerabilities: Vulnerability[] = (() => {
  const rand = mulberry32(2222)
  return VULNS.map((v, i) => ({
    ...v,
    id: `VULN-${4120 - i * 3}`,
    detectedAt: addDays(MOCK_TODAY, -intBetween(rand, 0, 40)),
  }))
})()

export const secretLeaks30d = 2
export const fixableCount = vulnerabilities.filter((v) => v.fixAvailable && v.status !== "resolved" && v.status !== "dismissed").length
export const mttrDays = 6.4

export type ComplianceCheck = { id: string; label: string; passed: boolean; detail: string }

export const complianceChecks: ComplianceCheck[] = [
  { id: "2fa", label: "전체 사용자 2FA 강제", passed: false, detail: "활성 사용자의 82%가 2FA를 사용 중" },
  { id: "branch", label: "기본 브랜치 보호 규칙", passed: true, detail: "활성 프로젝트 18개 모두 적용" },
  { id: "signed", label: "서명된 커밋 요구", passed: false, detail: "6개 프로젝트에서 미적용" },
  { id: "approvals", label: "MR 승인 최소 1명", passed: true, detail: "그룹 수준 규칙으로 적용" },
  { id: "secret", label: "푸시 시 시크릿 탐지", passed: true, detail: "전체 그룹에서 활성" },
  { id: "tokens", label: "PAT 만료 기한 90일", passed: true, detail: "만료 없는 토큰 0개" },
  { id: "deploy", label: "프로덕션 배포 승인 게이트", passed: true, detail: "보호된 환경 production" },
  { id: "admin", label: "관리자 계정 5개 이하", passed: false, detail: "현재 관리자 7명" },
]

export const projectRisk = [...projects]
  .map((p) => ({
    project: p.name,
    group: p.group,
    archived: p.archived,
    ...p.vulnerabilities,
    score: p.vulnerabilities.critical * 10 + p.vulnerabilities.high * 4 + p.vulnerabilities.medium + p.vulnerabilities.low * 0.2,
  }))
  .sort((a, b) => b.score - a.score)
  .slice(0, 8)
