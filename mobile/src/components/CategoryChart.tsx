import { View, Text, useWindowDimensions, useColorScheme, StyleSheet } from 'react-native'
import { scale, verticalScale } from 'react-native-size-matters'
import { Colors } from '@/constants/theme'
import type { CategoryBreakdown } from '@/types'

interface Props {
  data: CategoryBreakdown[]
  height?: number
}

export default function CategoryChart({ data, height = verticalScale(180) }: Props) {
  const scheme = useColorScheme()
  const colors = Colors[scheme ?? 'dark']
  const { width } = useWindowDimensions()
  const w = width - scale(112)
  const maxRev = Math.max(...data.map(d => d.revenue))
  const barArea = height - verticalScale(40)

  return (
    <View style={[styles.container, { height }]}>
      {data.map((d) => {
        const isTop = d.revenue === maxRev
        const barW = (w - scale(16) * (data.length - 1)) / data.length
        const barH = (d.revenue / maxRev) * barArea
        return (
          <View key={d.category} style={styles.col}>
            <View
              style={[
                styles.bar,
                {
                  width: barW,
                  height: barH,
                  backgroundColor: isTop ? colors.primary : colors.primaryContainer,
                  opacity: isTop ? 1 : 0.4,
                },
              ]}
            />
            <Text style={[styles.revLabel, { color: colors.primary }]}>
              ${(d.revenue / 1e6).toFixed(1)}M
            </Text>
            <Text style={[styles.catLabel, { color: colors.textSecondary }]} numberOfLines={2}>
              {d.category}
            </Text>
          </View>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  col: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    borderRadius: scale(6),
    minHeight: scale(4),
  },
  revLabel: {
    fontSize: scale(9),
    fontWeight: '600',
    marginTop: verticalScale(4),
  },
  catLabel: {
    fontSize: scale(10),
    textAlign: 'center',
    marginTop: verticalScale(2),
  },
})
