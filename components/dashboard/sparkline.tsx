import * as React from "react"

type SparklineProps = {
  data: number[]
  /** any CSS color, usually a tone or chart variable */
  color?: string
  className?: string
  /** smooth vertical gradient area under the line */
  fill?: boolean
  strokeWidth?: number
}

function buildSmoothPath(points: readonly (readonly [number, number])[]) {
  if (points.length === 0) return ""
  if (points.length === 1) return `M${points[0][0].toFixed(1)},${points[0][1].toFixed(1)}`
  let d = `M${points[0][0].toFixed(1)},${points[0][1].toFixed(1)}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[Math.min(points.length - 1, i + 2)]
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6
    d += ` C${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`
  }
  return d
}

/**
 * Apple Stocks-inspired smooth Bezier inline sparkline with optional gradient area fill.
 */
export function Sparkline({
  data,
  color = "var(--chart-1)",
  className,
  fill = true,
  strokeWidth = 1.9,
}: SparklineProps) {
  const rawId = React.useId()
  const gradId = `spark-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`

  if (data.length < 2) return null

  const w = 104
  const h = 34
  const padX = 3.5
  const padY = 4.5
  const min = Math.min(...data)
  const max = Math.max(...data)
  const span = max - min || 1
  const step = (w - padX * 2) / (data.length - 1)
  const points = data.map((v, i) => [padX + i * step, padY + (1 - (v - min) / span) * (h - padY * 2)] as const)
  const line = buildSmoothPath(points)
  const area = `${line} L${points[points.length - 1][0].toFixed(1)},${h} L${points[0][0].toFixed(1)},${h} Z`
  const [lx, ly] = points[points.length - 1]

  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className={className} aria-hidden="true">
      {fill && (
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.22} />
            <stop offset="100%" stopColor={color} stopOpacity={0.0} />
          </linearGradient>
        </defs>
      )}
      {fill && <path d={area} fill={`url(#${gradId})`} />}
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <circle cx={lx} cy={ly} r={2.5} fill={color} vectorEffect="non-scaling-stroke" />
    </svg>
  )
}
