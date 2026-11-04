import {
  CircleArrowUpIcon,
  FolderGit2Icon,
  GitCommitHorizontalIcon,
  GitPullRequestIcon,
  HardDriveIcon,
  LayoutDashboardIcon,
  ScrollTextIcon,
  ServerIcon,
  ShieldCheckIcon,
  SirenIcon,
  UserCogIcon,
  UsersIcon,
  WorkflowIcon,
  type LucideIcon,
} from "lucide-react"

export type Tone = "indigo" | "emerald" | "amber" | "rose" | "sky" | "violet" | "teal" | "orange"

export type NavItem = {
  title: string
  url: string
  icon: LucideIcon
  description: string
  tone: Tone
  keywords?: string[]
}

export type NavGroup = {
  label: string
  items: NavItem[]
}

export const navGroups: NavGroup[] = [
  {
    label: "모니터링",
    items: [
      { title: "개요", url: "/", icon: LayoutDashboardIcon, description: "엔터프라이즈 GitLab 상태와 핵심 지표 요약", tone: "indigo", keywords: ["overview", "home", "대시보드"] },
      { title: "파이프라인", url: "/pipelines", icon: WorkflowIcon, description: "CI/CD 성공률, 퍼센타일 소요 시간, 실패 스테이지 분석", tone: "sky", keywords: ["pipelines", "ci", "cd", "jobs"] },
      { title: "러너", url: "/runners", icon: ServerIcon, description: "러너 클러스터 용량, 실행기 부하 및 버전 상태", tone: "teal", keywords: ["runners", "executor"] },
      { title: "인시던트", url: "/incidents", icon: SirenIcon, description: "실시간 장애 대응, 온콜 로테이션, MTTR 및 SLA 가용성", tone: "rose", keywords: ["incidents", "on-call", "장애"] },
    ],
  },
  {
    label: "개발 활동",
    items: [
      { title: "커밋", url: "/commits", icon: GitCommitHorizontalIcon, description: "기여자 리더보드, 시간대 패턴 및 연간 히트맵", tone: "violet", keywords: ["commits", "leaderboard", "순위", "기여"] },
      { title: "머지 리퀘스트", url: "/merge-requests", icon: GitPullRequestIcon, description: "코드 리뷰 대기열, 처리량 및 머지 리드타임", tone: "orange", keywords: ["merge requests", "mr", "review", "리뷰"] },
      { title: "프로젝트", url: "/projects", icon: FolderGit2Icon, description: "전체 저장소 카탈로그, 언어 구성 및 활동 건강도", tone: "emerald", keywords: ["projects", "repositories", "저장소"] },
    ],
  },
  {
    label: "거버넌스 · 관리",
    items: [
      { title: "사용자", url: "/users", icon: UsersIcon, description: "조직 계정 현황, 입·퇴사 추이 및 2FA 보안 준수율", tone: "indigo", keywords: ["users", "members", "멤버", "계정"] },
      { title: "권한 관리", url: "/access", icon: UserCogIcon, description: "접근 요청 결재, 그룹 역할 매트릭스 및 관리자 거버넌스", tone: "orange", keywords: ["access", "permissions", "roles", "admin", "권한", "승인", "인가", "관리자"] },
      { title: "스토리지", url: "/storage", icon: HardDriveIcon, description: "저장소·아티팩트·레지스트리 점유율 및 정리 후보", tone: "amber", keywords: ["storage", "disk", "artifacts", "registry"] },
      { title: "보안", url: "/security", icon: ShieldCheckIcon, description: "취약점 탐지 현황, 스캐너 지표 및 컴플라이언스 점검", tone: "rose", keywords: ["security", "vulnerabilities", "취약점"] },
      { title: "감사 로그", url: "/audit", icon: ScrollTextIcon, description: "인증, 권한, 토큰 및 시스템 설정 변경 추적", tone: "sky", keywords: ["audit", "log", "events"] },
      { title: "업그레이드", url: "/upgrade", icon: CircleArrowUpIcon, description: "소프트웨어 업데이트 경로, 사전 점검 및 호환성 가이드", tone: "violet", keywords: ["upgrade", "version", "release"] },
    ],
  },
]

export const navItems: NavItem[] = navGroups.flatMap((g) => g.items)

/** usePathname() may carry a trailing slash because of `trailingSlash: true`. */
export function normalizePath(pathname: string | null) {
  if (!pathname || pathname === "/") return "/"
  return pathname.replace(/\/+$/, "")
}

export function findNavItem(pathname: string | null) {
  const path = normalizePath(pathname)
  return navItems.find((item) => item.url === path)
}

export function findNavGroup(pathname: string | null) {
  const path = normalizePath(pathname)
  return navGroups.find((g) => g.items.some((item) => item.url === path))
}
