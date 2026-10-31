import { MOCK_NOW } from "@/lib/mock/core"

/** 1234567 -> "1,234,567" (no locale dependency, same output on server and client) */
export function fmtInt(n: number) {
  const rounded = Math.round(n)
  const sign = rounded < 0 ? "-" : ""
  return sign + String(Math.abs(rounded)).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

/** 12345 -> "1.2만", 1234 -> "1,234" */
export function fmtCompact(n: number) {
  if (Math.abs(n) >= 100_000_000) return `${(n / 100_000_000).toFixed(1)}억`
  if (Math.abs(n) >= 10_000) return `${(n / 10_000).toFixed(1)}만`
  return fmtInt(n)
}

export function fmtPct(n: number, digits = 1) {
  return `${n.toFixed(digits)}%`
}

/** value in MB -> "850 MB" / "1.2 GB" / "1.5 TB" */
export function fmtSize(mb: number) {
  if (mb >= 1_000_000) return `${(mb / 1_000_000).toFixed(2)} TB`
  if (mb >= 1_000) return `${(mb / 1_000).toFixed(mb >= 10_000 ? 0 : 1)} GB`
  return `${Math.round(mb)} MB`
}

/** minutes -> "45분" / "1시간 23분" / "2일 4시간" */
export function fmtMinutes(min: number) {
  const m = Math.round(min)
  if (m < 60) return `${m}분`
  const h = Math.floor(m / 60)
  const rest = m % 60
  if (h < 24) return rest ? `${h}시간 ${rest}분` : `${h}시간`
  const d = Math.floor(h / 24)
  const hr = h % 24
  return hr ? `${d}일 ${hr}시간` : `${d}일`
}

/** seconds -> "42초" / "4분 12초" / "1시간 3분" */
export function fmtSeconds(sec: number) {
  const s = Math.round(sec)
  if (s < 60) return `${s}초`
  const m = Math.floor(s / 60)
  const rest = s % 60
  if (m < 60) return rest ? `${m}분 ${rest}초` : `${m}분`
  return fmtMinutes(m)
}

/** hours -> "6.5시간" / "2.1일" */
export function fmtHours(h: number) {
  if (h < 24) return `${h.toFixed(h < 10 ? 1 : 0)}시간`
  return `${(h / 24).toFixed(1)}일`
}

function parts(iso: string) {
  const [date, time = "00:00"] = iso.split("T")
  const [y, m, d] = date.split("-").map(Number)
  const [hh, mm] = time.split(":").map(Number)
  return { y, m, d, hh, mm }
}

/** "2026-10-31" -> "10월 31일" */
export function fmtDate(iso: string) {
  const { m, d } = parts(iso)
  return `${m}월 ${d}일`
}

/** "2026-10-31" -> "2026년 10월 31일" */
export function fmtDateFull(iso: string) {
  const { y, m, d } = parts(iso)
  return `${y}년 ${m}월 ${d}일`
}

/** "2026-10-31" -> "10/31" */
export function fmtDateShort(iso: string) {
  const { m, d } = parts(iso)
  return `${m}/${d}`
}

/** "2026-10-31T09:41:00" -> "10월 31일 09:41" */
export function fmtDateTime(iso: string) {
  const { m, d, hh, mm } = parts(iso)
  return `${m}월 ${d}일 ${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`
}

/** "2026-10-31T09:41:00" -> "09:41" */
export function fmtTime(iso: string) {
  const { hh, mm } = parts(iso)
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`
}

/** "2026-10" -> "10월" */
export function fmtMonth(yyyyMm: string) {
  return `${Number(yyyyMm.slice(5, 7))}월`
}

/** Monday iso -> "10/26 ~ 11/1" */
export function fmtWeekRange(mondayIso: string) {
  const start = parts(mondayIso)
  const end = new Date(`${mondayIso}T00:00:00Z`)
  end.setUTCDate(end.getUTCDate() + 6)
  return `${start.m}/${start.d} ~ ${end.getUTCMonth() + 1}/${end.getUTCDate()}`
}

const WEEKDAYS_KO = ["일", "월", "화", "수", "목", "금", "토"]

export function fmtWeekday(iso: string) {
  return WEEKDAYS_KO[new Date(`${iso.slice(0, 10)}T00:00:00Z`).getUTCDay()]
}

/** relative to the fixed mock clock: "방금 전", "12분 전", "3시간 전", "2일 전", "3주 전" */
export function relativeTime(iso: string, now: string = MOCK_NOW) {
  const target = Date.parse(`${iso.length === 10 ? `${iso}T00:00:00` : iso}Z`)
  const base = Date.parse(`${now}Z`)
  const diffMin = Math.round((base - target) / 60000)
  if (diffMin < 1) return "방금 전"
  if (diffMin < 60) return `${diffMin}분 전`
  const h = Math.floor(diffMin / 60)
  if (h < 24) return `${h}시간 전`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}일 전`
  const w = Math.floor(d / 7)
  if (w < 5) return `${w}주 전`
  const mo = Math.floor(d / 30)
  if (mo < 12) return `${mo}개월 전`
  return `${Math.floor(d / 365)}년 전`
}

/** "김민준" -> "김", "Jane Doe" -> "JD" */
export function initials(name: string) {
  const trimmed = name.trim()
  if (/^[가-힣]/.test(trimmed)) return trimmed.charAt(0)
  return trimmed
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export function signed(n: number, digits = 0) {
  const v = digits ? n.toFixed(digits) : fmtInt(n)
  return n > 0 ? `+${v}` : v
}
