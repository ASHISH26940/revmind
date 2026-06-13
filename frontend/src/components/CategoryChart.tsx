export default function CategoryChart({ data }: { data: { category: string; revenue: number }[] }) {
  const maxRev = Math.max(...data.map((d) => d.revenue))

  return (
    <div className="h-72 w-full flex items-end justify-between gap-4 px-4 pb-4">
      {data.map((d) => {
        const isTop = d.revenue === maxRev
        return (
          <div key={d.category} className="flex flex-col items-center gap-2 flex-1 group">
            <div
              className={`w-full rounded-t-lg relative transition-all duration-300 ${
                isTop ? 'bg-primary' : 'bg-primary-container/20 group-hover:bg-primary-container/40'
              }`}
              style={{ height: `${(d.revenue / maxRev) * 100}%` }}
            >
              <div
                className={`absolute -top-6 left-1/2 -translate-x-1/2 text-label-sm whitespace-nowrap ${
                  isTop ? 'text-primary' : 'text-primary opacity-0 group-hover:opacity-100'
                }`}
              >
                ${(d.revenue / 1e6).toFixed(1)}M
              </div>
            </div>
            <span className="text-label-sm text-on-surface-variant text-center">{d.category}</span>
          </div>
        )
      })}
    </div>
  )
}
