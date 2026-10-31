type SparklineProps = {
  data: number[]
  /** any CSS color, usually a tone or chart variable */
  color?: string
  className?: string
  /** flat translucent area under the line */
  fill?: boolean
  strokeWidth?: number
}

/**
 * Minimal inline sparkline. No axes, no labels: it only shows the shape.
 * The last point is marked so the current value is easy to find.
 */
export function Sparkline({ data, color = "var(--chart-1)", className, fill = false, strokeWidth = 2 }: SparklineProps) {
  if (data.length < 2) return null

  const w = 100
  const h = 32
  const pad = 3
  const min = Math.min(...data)
  const max = Math.max(...data)
  const span = max - min || 1
  const step = (w - pad * 2) / (data.length - 1)
  const points = data.map((v, i) => [pad + i * step, pad + (1 - (v - min) / span) * (h - pad * 2)] as const)
  const line = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ")
  const area = `${line} L${points[points.length - 1][0].toFixed(1)},${h} L${points[0][0].toFixed(1)},${h} Z`
  const [lx, ly] = points[points.length - 1]

  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className={className} aria-hidden="true">
      {fill && <path d={area} fill={color} fillOpacity={0.12} />}
      <path d={line} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <circle cx={lx} cy={ly} r={2.6} fill={color} vectorEffect="non-scaling-stroke" />
    </svg>
  )
}
