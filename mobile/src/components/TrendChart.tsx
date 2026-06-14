import { View, Text, StyleSheet, useWindowDimensions } from 'react-native'
import Svg, { Path, Line, Defs, LinearGradient, Stop } from 'react-native-svg'
import { scale, verticalScale } from 'react-native-size-matters'
import { useColorScheme } from 'react-native'
import { Colors } from '@/constants/theme'
import type { TrendDataPoint } from '@/types'

const PADDING = scale(40)

export default function TrendChart({ data }: { data: TrendDataPoint[] }) {
  const scheme = useColorScheme()
  const colors = Colors[scheme ?? 'dark']
  const { width } = useWindowDimensions()
  const w = width - scale(64)
  const h = verticalScale(220)

  if (!data.length) return null

  const max = Math.max(...data.map(d => d.revenue))
  const min = Math.min(...data.map(d => d.revenue))
  const range = max - min || 1
  const stepX = (w - PADDING * 2) / (data.length - 1 || 1)

  const lineParts = data.map((d, i) => {
    const x = PADDING + i * stepX
    const y = h - PADDING - ((d.revenue - min) / range) * (h - PADDING * 2)
    return `${i === 0 ? 'M' : 'L'}${x} ${y}`
  })
  const lineD = lineParts.join(' ')
  const areaD = `${lineD} L${PADDING + (data.length - 1) * stepX} ${h - PADDING} L${PADDING} ${h - PADDING} Z`

  return (
    <View>
      <Svg width={w} height={h}>
        <Defs>
          <LinearGradient id="grad" x1="0" x2="0" y1="0" y2="1">
            <Stop offset="0%" stopColor={colors.primary} stopOpacity="0.15" />
            <Stop offset="100%" stopColor={colors.primary} stopOpacity="0" />
          </LinearGradient>
        </Defs>
        {[0.25, 0.5, 0.75].map(f => (
          <Line key={f} x1="0" x2={w} y1={h * f} y2={h * f} stroke={colors.outline} strokeOpacity={0.3} strokeDasharray="4" />
        ))}
        <Path d={areaD} fill="url(#grad)" />
        <Path d={lineD} fill="none" stroke={colors.primary} strokeWidth={2} />
      </Svg>
      <View style={styles.labels}>
        {data.filter((_, i) => i % Math.ceil(data.length / 4) === 0).map(d => (
          <Text key={d.month} style={[styles.label, { color: colors.textSecondary }]}>{d.month}</Text>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: scale(32),
    marginTop: verticalScale(-8),
  },
  label: {
    fontSize: scale(10),
  },
})
