export interface TrendDataPoint {
  month: string
  revenue: number
}

export interface CategoryBreakdown {
  category: string
  revenue: number
}

export interface TopRegion {
  region: string
  revenue: number
}

export interface TopChannel {
  channel: string
  revenue: number
}

export interface TopProduct {
  product_name: string
  revenue: number
}

export interface SummaryTrends {
  revenue_change_pct: number
  margin_change_pct: number
}

export interface SummaryData {
  total_revenue: number
  total_units: number
  profit_margin_pct: number
  top_region: TopRegion
  top_channel: TopChannel
  top_product: TopProduct
  category_breakdown: CategoryBreakdown[]
  trends: SummaryTrends
}
