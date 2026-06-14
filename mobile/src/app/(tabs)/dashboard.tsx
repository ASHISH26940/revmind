import { useEffect, useState } from 'react'
import { View, Text, ScrollView, ActivityIndicator, useColorScheme, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { MaterialIcons } from '@expo/vector-icons'
import { scale, verticalScale } from 'react-native-size-matters'
import { Colors } from '@/constants/theme'
import { fetchSummary, fetchTrends } from '@/api'
import type { SummaryData, TrendDataPoint } from '@/types'
import KpiCard from '@/components/KpiCard'
import TrendChart from '@/components/TrendChart'
import CategoryChart from '@/components/CategoryChart'

export default function Dashboard() {
  const scheme = useColorScheme()
  const colors = Colors[scheme ?? 'dark']
  const insets = useSafeAreaInsets()
  const [summary, setSummary] = useState<SummaryData | null>(null)
  const [trends, setTrends] = useState<TrendDataPoint[]>([])

  useEffect(() => {
    fetchSummary().then(setSummary)
    fetchTrends().then(setTrends)
  }, [])

  if (!summary) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background, paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  return (
    <ScrollView style={[styles.scroll, { backgroundColor: colors.background }]} contentContainerStyle={[styles.content, { paddingTop: insets.top + scale(8) }]}>
      <Text style={[styles.title, { color: colors.text }]}>Executive Summary</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Real-time performance monitoring</Text>

      <View style={styles.kpiRow}>
        <View style={styles.kpiCol}>
          <KpiCard
            label="Total Net Revenue"
            value={`$${(summary.total_revenue / 1e6).toFixed(1)}M`}
            icon="trending-up"
            trend={{
              dir: summary.trends.revenue_change_pct >= 0 ? 'up' : 'down',
              pct: `${summary.trends.revenue_change_pct >= 0 ? '+' : ''}${summary.trends.revenue_change_pct}%`,
            }}
          />
        </View>
        <View style={styles.kpiCol}>
          <KpiCard
            label="Gross Profit Margin"
            value={`${summary.profit_margin_pct}%`}
            icon="pie-chart"
            trend={{
              dir: summary.trends.margin_change_pct >= 0 ? 'up' : 'down',
              pct: `${summary.trends.margin_change_pct >= 0 ? '+' : ''}${summary.trends.margin_change_pct}pp`,
            }}
          />
        </View>
        <View style={styles.kpiCol}>
          <KpiCard
            label="Top Region"
            value={summary.top_region.region}
            icon="location-on"
          />
        </View>
      </View>

      <View style={[styles.chartCard, { backgroundColor: colors.surfaceContainer, borderColor: colors.outline }]}>
        <View style={styles.chartHeader}>
          <MaterialIcons name="show-chart" size={scale(18)} color={colors.primary} />
          <Text style={[styles.chartTitle, { color: colors.text }]}>Monthly Revenue Trends</Text>
        </View>
        <TrendChart data={trends} />
      </View>

      <View style={[styles.chartCard, { backgroundColor: colors.surfaceContainer, borderColor: colors.outline }]}>
        <View style={styles.chartHeader}>
          <MaterialIcons name="bar-chart" size={scale(18)} color={colors.primary} />
          <Text style={[styles.chartTitle, { color: colors.text }]}>Category Breakdown</Text>
        </View>
        <CategoryChart data={summary.category_breakdown} />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { flex: 1 },
  content: { padding: scale(16), paddingBottom: verticalScale(40) },
  title: { fontSize: scale(24), fontWeight: '700', marginTop: verticalScale(8) },
  subtitle: { fontSize: scale(14), marginBottom: verticalScale(16) },
  kpiRow: { gap: scale(8), marginBottom: verticalScale(16) },
  kpiCol: { marginBottom: verticalScale(8) },
  chartCard: { borderRadius: scale(12), borderWidth: 1, padding: scale(16), marginBottom: verticalScale(16) },
  chartHeader: { flexDirection: 'row', alignItems: 'center', gap: scale(8), marginBottom: verticalScale(12) },
  chartTitle: { fontSize: scale(16), fontWeight: '600' },
})
