const W = 800, H = 280, P = 40

function linePath(data: { revenue: number }[]): string {
  if (!data.length) return ''
  const max = Math.max(...data.map((d) => d.revenue))
  const min = Math.min(...data.map((d) => d.revenue))
  const range = max - min || 1
  const stepX = (W - P * 2) / (data.length - 1 || 1)
  return data
    .map((d, i) => {
      const x = P + i * stepX
      const y = H - P - ((d.revenue - min) / range) * (H - P * 2)
      return `${i === 0 ? 'M' : 'L'}${x} ${y}`
    })
    .join(' ')
}

function areaPath(data: { revenue: number }[]): string {
  if (!data.length) return ''
  const p = linePath(data)
  const last = data.length - 1
  const stepX = (W - P * 2) / (data.length - 1 || 1)
  const xEnd = P + last * stepX
  return `${p} L${xEnd} ${H - P} L${P} ${H - P} Z`
}

export default function TrendChart({ data }: { data: { month: string; revenue: number }[] }) {
  return (
    <div className="h-72 w-full relative">
      <svg className="w-full h-full" viewBox={`0 0 ${W} ${H}`}>
        {[40, 100, 160, 220].map((y) => (
          <line key={y} stroke="#33343c" strokeDasharray="4" x1="0" x2={W} y1={y} y2={y} />
        ))}
        <defs>
          <linearGradient id="grad-violet" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#cebdff" />
            <stop offset="100%" stopColor="#cebdff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath(data)} fill="url(#grad-violet)" opacity={0.1} />
        <path d={linePath(data)} fill="none" stroke="#cebdff" strokeWidth={3} />
      </svg>
      <div className="absolute bottom-2 left-0 right-0 flex justify-between px-10 text-label-sm text-on-surface-variant">
        {data.filter((_, i) => i % Math.ceil(data.length / 6) === 0).map((d) => (
          <span key={d.month}>{d.month}</span>
        ))}
      </div>
    </div>
  )
}
