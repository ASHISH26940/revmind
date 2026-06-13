interface Props {
  label: string
  value: string
  icon: string
  trend?: { dir: 'up' | 'down' | 'neutral'; pct: string }
}

export default function KpiCard({ label, value, icon, trend }: Props) {
  const trendColor = trend?.dir === 'up' ? 'text-emerald-400' : trend?.dir === 'down' ? 'text-red-400' : 'text-on-surface-variant'

  return (
    <div className="bg-surface-container border border-surface-container-highest rounded-xl p-5">
      <div className="flex justify-between items-start mb-4">
        <span className="p-2 bg-primary/10 rounded-lg">
          <span className="material-symbols-outlined text-primary">{icon}</span>
        </span>
        {trend && (
          <span className={`${trendColor} text-label-sm font-bold flex items-center gap-1`}>
            <span className="material-symbols-outlined text-[16px]">
              {trend.dir === 'up' ? 'trending_up' : trend.dir === 'down' ? 'trending_down' : 'remove'}
            </span>
            {trend.pct}
          </span>
        )}
      </div>
      <p className="text-label-md text-on-surface-variant mb-1">{label}</p>
      <h3 className="font-headline-md text-headline-md text-white">{value}</h3>
    </div>
  )
}
