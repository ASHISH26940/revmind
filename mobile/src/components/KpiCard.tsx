import { View, Text, StyleSheet } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { scale, verticalScale } from 'react-native-size-matters'
import { useColorScheme } from 'react-native'
import { Colors } from '@/constants/theme'

interface Props {
  label: string
  value: string
  icon: keyof typeof MaterialIcons.glyphMap
  trend?: { dir: 'up' | 'down'; pct: string }
}

export default function KpiCard({ label, value, icon, trend }: Props) {
  const scheme = useColorScheme()
  const colors = Colors[scheme ?? 'dark']

  return (
    <View style={[styles.card, { backgroundColor: colors.surfaceContainer, borderColor: colors.outline }]}>
      <View style={styles.header}>
        <MaterialIcons name={icon} size={scale(18)} color={colors.primary} />
        <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
        {trend && (
          <View style={[styles.trend, { backgroundColor: trend.dir === 'up' ? '#052e16' : '#450a0a' }]}>
            <Text style={[styles.trendText, { color: trend.dir === 'up' ? '#4ade80' : '#f87171' }]}>
              {trend.dir === 'up' ? '↑' : '↓'} {trend.pct}
            </Text>
          </View>
        )}
      </View>
      <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: scale(12),
    borderWidth: 1,
    padding: scale(16),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(8),
  },
  label: {
    fontSize: scale(12),
    fontWeight: '600',
  },
  trend: {
    borderRadius: scale(6),
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(2),
  },
  trendText: {
    fontSize: scale(11),
    fontWeight: '700',
  },
  value: {
    fontSize: scale(22),
    fontWeight: '700',
  },
})
