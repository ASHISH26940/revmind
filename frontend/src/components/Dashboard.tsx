import { useState, useEffect } from 'react'
import KpiCard from './KpiCard'
import TrendChart from './TrendChart'
import CategoryChart from './CategoryChart'

const API = ''

async function fetchJson(path: string) {
  const res = await fetch(`${API}${path}`)
  const { data } = await res.json()
  return data
}

export default function Dashboard() {
  const [summary, setSummary] = useState<any>(null)
  const [trends, setTrends] = useState<any[]>([])

  useEffect(() => {
    fetchJson('/api/summary').then(setSummary)
    fetchJson('/api/trends').then(setTrends)
  }, [])

  if (!summary) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex gap-1 items-center">
          <div className="w-2 h-2 bg-primary rounded-full dot-pulse" style={{ animationDelay: '0s' }} />
          <div className="w-2 h-2 bg-primary rounded-full dot-pulse" style={{ animationDelay: '0.2s' }} />
          <div className="w-2 h-2 bg-primary rounded-full dot-pulse" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>
    )
  }

  return (
    <section className="space-y-gutter">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-white font-bold tracking-tight">Executive Summary</h1>
          <p className="text-body-lg text-on-surface-variant mt-1">Real-time performance monitoring across all dimensions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        <KpiCard
          icon="payments"
          label="Total Net Revenue"
          value={`$${(summary.total_revenue / 1e6).toFixed(1)}M`}
          trend={{ dir: 'up', pct: '+12.5%' }}
        />
        <KpiCard
          icon="pie_chart"
          label="Gross Profit Margin"
          value={`${summary.profit_margin_pct}%`}
          trend={{ dir: 'up', pct: '+3.2%' }}
        />
        <KpiCard
          icon="public"
          label="Top Region"
          value={summary.top_region.region}
          trend={{ dir: 'neutral', pct: 'Steady' }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        <div className="lg:col-span-8 bg-surface-container border border-surface-container-highest rounded-xl p-5">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-title-lg text-title-lg text-white">Monthly Revenue Trends</h4>
          </div>
          <TrendChart data={trends} />
        </div>

        <div className="lg:col-span-4 bg-surface-container border border-surface-container-highest rounded-xl p-5">
          <h4 className="font-title-lg text-title-lg text-white mb-6">Category Breakdown</h4>
          <CategoryChart data={summary.category_breakdown} />
        </div>
      </div>
    </section>
  )
}
