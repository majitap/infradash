export type UpgradeStepStatus = "done" | "in-progress" | "pending"

export type ChecklistItem = { id: string; label: string; done: boolean }

export type UpgradeStep = {
  version: string
  kind: "required-stop" | "target"
  status: UpgradeStepStatus
  notes: string
  releaseDate: string
  highlights: string[]
  checklist: ChecklistItem[]
}

export const upgradePlan = {
  product: "GitLab Self-Managed (Omnibus)",
  edition: "Enterprise Edition",
  currentVersion: "17.8.7",
  targetVersion: "18.5.2",
  maintenanceWindow: "2026-11-15 02:00 ~ 06:00 KST",
  owner: "플랫폼팀",
  estimatedDowntimeMin: 45,
  postgresVersion: "16.4",
  redisVersion: "7.2",
  gitalyNodes: 3,
}

const stopChecklist = (v: string, doneCount: number): ChecklistItem[] =>
  [
    { id: `${v}-backup`, label: "전체 백업 및 Gitaly 볼륨 스냅샷" },
    { id: `${v}-migrations`, label: "배치 백그라운드 마이그레이션 완료 확인" },
    { id: `${v}-upgrade`, label: `패키지를 ${v}로 업그레이드` },
    { id: `${v}-smoke`, label: "스모크 테스트 (로그인, clone, 파이프라인, 레지스트리)" },
  ].map((item, i) => ({ ...item, done: i < doneCount }))

export const upgradeSteps: UpgradeStep[] = [
  {
    version: "17.11.7",
    kind: "required-stop",
    status: "done",
    releaseDate: "2026-06-11",
    notes: "필수 경유 버전. 배치 백그라운드 마이그레이션이 끝나야 다음 단계로 진행할 수 있습니다.",
    highlights: ["CI/CD 카탈로그 GA", "Duo 코드 리뷰 개선", "레지스트리 메타데이터 DB 필수화"],
    checklist: stopChecklist("17.11.7", 4),
  },
  {
    version: "18.2.8",
    kind: "required-stop",
    status: "in-progress",
    releaseDate: "2026-08-20",
    notes: "필수 경유 버전. 폐기된 CI 키워드와 러너 등록 토큰 변경 사항을 점검하세요.",
    highlights: ["러너 등록 토큰 제거 (인증 토큰 전환)", "only/except 키워드 폐기 경고", "PostgreSQL 16 필수"],
    checklist: stopChecklist("18.2.8", 2),
  },
  {
    version: "18.5.2",
    kind: "target",
    status: "pending",
    releaseDate: "2026-10-22",
    notes: "목표 버전. 업그레이드 후 러너를 같은 마이너 버전으로 올립니다.",
    highlights: ["MR 승인 정책 v2", "컨테이너 스캐닝 속도 개선", "Geo 복제 상태 대시보드"],
    checklist: [
      ...stopChecklist("18.5.2", 0),
      { id: "18.5.2-runners", label: "러너를 18.5.x로 롤링 업그레이드", done: false },
      { id: "18.5.2-announce", label: "엔지니어링 조직에 완료 공지", done: false },
    ],
  },
]

export const preUpgradeChecks: ChecklistItem[] = [
  { id: "pre-disk", label: "데이터 볼륨 여유 공간 30% 이상", done: true },
  { id: "pre-pg", label: "목표 릴리스가 지원하는 PostgreSQL 버전", done: true },
  { id: "pre-deprecations", label: "폐기 기능 및 호환성 변경 검토", done: true },
  { id: "pre-staging", label: "스테이징에서 전체 경로 리허설", done: false },
  { id: "pre-notice", label: "전체 사용자에게 점검 공지 발송", done: false },
  { id: "pre-freeze", label: "배포 동결 및 프로덕션 러너 일시중지", done: true },
]

export const breakingChanges = [
  { version: "18.0", title: "러너 등록 토큰 제거", impact: "러너 12대 중 3대가 구 토큰 방식", action: "인증 토큰으로 재등록" },
  { version: "18.0", title: "only/except CI 키워드 폐기", impact: "7개 프로젝트 .gitlab-ci.yml에서 사용", action: "rules:로 전환" },
  { version: "18.2", title: "PostgreSQL 14 지원 종료", impact: "현재 16.4 사용 중", action: "조치 불필요" },
  { version: "18.3", title: "레거시 컨테이너 레지스트리 스토리지 제거", impact: "메타데이터 DB 마이그레이션 완료됨", action: "조치 불필요" },
]
