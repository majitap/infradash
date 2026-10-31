import { MONTHS_12, mulberry32 } from "./core"
import { projects, totalStorage, type StorageBreakdown } from "./projects"

export type StorageKind = keyof StorageBreakdown

export const STORAGE_KINDS: { key: StorageKind; label: string }[] = [
  { key: "repository", label: "저장소" },
  { key: "artifacts", label: "아티팩트" },
  { key: "registry", label: "컨테이너 레지스트리" },
  { key: "lfs", label: "LFS" },
  { key: "packages", label: "패키지" },
  { key: "uploads", label: "기타" },
]

/** totals per kind in MB (wiki folded into "기타") */
export const storageByKind = STORAGE_KINDS.map(({ key, label }) => ({
  key,
  label,
  mb: projects.reduce((s, p) => s + p.storage[key] + (key === "uploads" ? p.storage.wiki : 0), 0),
}))

export const storageTotalMb = storageByKind.reduce((s, k) => s + k.mb, 0)
export const storageQuotaMb = 1_000_000 // 1 TB

export const topStorageProjects = [...projects]
  .sort((a, b) => totalStorage(b) - totalStorage(a))
  .slice(0, 10)
  .map((p) => ({
    project: p.name,
    group: p.group,
    archived: p.archived,
    total: totalStorage(p),
    repository: p.storage.repository,
    artifacts: p.storage.artifacts,
    registry: p.storage.registry,
    lfs: p.storage.lfs,
    packages: p.storage.packages,
    uploads: p.storage.uploads + p.storage.wiki,
  }))

/** cumulative GB per kind by month, ending at today's totals */
export const monthlyStorage = (() => {
  const rand = mulberry32(808)
  const finals = Object.fromEntries(storageByKind.map((k) => [k.key, k.mb / 1000])) as Record<StorageKind, number>
  return MONTHS_12.map((month, i) => {
    const ratio = 0.46 + (i / 11) * 0.54
    const row: Record<string, number | string> = { month }
    for (const k of STORAGE_KINDS) {
      const wobble = 1 + (rand() - 0.5) * 0.06
      row[k.key] = Math.round(finals[k.key] * ratio * (i === 11 ? 1 : wobble) * 10) / 10
    }
    return row as { month: string } & Record<StorageKind, number>
  })
})()

export const storageGrowth30dMb = Math.round(
  (monthlyStorage[11].repository + monthlyStorage[11].artifacts + monthlyStorage[11].registry + monthlyStorage[11].lfs + monthlyStorage[11].packages + monthlyStorage[11].uploads -
    (monthlyStorage[10].repository + monthlyStorage[10].artifacts + monthlyStorage[10].registry + monthlyStorage[10].lfs + monthlyStorage[10].packages + monthlyStorage[10].uploads)) *
    1000
)

export const cleanupCandidates = [
  { label: "만료된 잡 아티팩트", mb: 86_400, action: "30일 보존 정책 적용", kind: "artifacts" as StorageKind },
  { label: "태그 없는 컨테이너 이미지", mb: 54_200, action: "레지스트리 GC 실행", kind: "registry" as StorageKind },
  { label: "아카이브 프로젝트 저장소", mb: 12_800, action: "오브젝트 스토리지로 이관", kind: "repository" as StorageKind },
  { label: "90일 이상 미사용 패키지 버전", mb: 8_900, action: "구버전 정리", kind: "packages" as StorageKind },
]

export const cleanupTotalMb = cleanupCandidates.reduce((s, c) => s + c.mb, 0)
