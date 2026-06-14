import { View, Text, StyleSheet } from 'react-native'
import { Colors } from '@/constants/theme'

function parseInline(text: string): (string | { bold?: string; italic?: string; code?: string })[] {
  const parts: (string | { bold?: string; italic?: string; code?: string })[] = []
  const regex = /(`+)(.*?)\1|(\*\*)(.*?)\*\*|(\*)(.*?)\*/g
  let last = 0
  let match: RegExpExecArray | null
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(text.slice(last, match.index))
    }
    if (match[1]) {
      parts.push({ code: match[2] })
    } else if (match[3]) {
      parts.push({ bold: match[4] })
    } else if (match[5]) {
      parts.push({ italic: match[6] })
    }
    last = match.index + match[0].length
  }
  if (last < text.length) {
    parts.push(text.slice(last))
  }
  return parts
}

export default function Markdown({ text, colors }: { text: string; colors: typeof Colors[keyof typeof Colors] }) {
  const lines = text.split('\n')
  const elements: JSX.Element[] = []
  let key = 0

  let i = 0
  while (i < lines.length) {
    const line = lines[i]

    if (line.trimStart().startsWith('```')) {
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].trimStart().startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      i++
      elements.push(
        <View key={key++} style={[styles.codeBlock, { backgroundColor: colors.surfaceContainerHigh }]}>
          <Text style={[styles.codeText, { color: colors.text }]}>{codeLines.join('\n')}</Text>
        </View>
      )
      continue
    }

    const headingMatch = line.match(/^(#{1,3})\s+(.+)$/)
    if (headingMatch) {
      elements.push(
        <Text key={key++} style={[styles.h3, { color: colors.text }]}>
          {parseInline(headingMatch[2])}
        </Text>
      )
      i++
      continue
    }

    if (/^(-|\*)\s/.test(line.trimStart())) {
      const items: string[] = []
      while (i < lines.length && /^(\s*)[-*]\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ''))
        i++
      }
      elements.push(
        <View key={key++} style={styles.list}>
          {items.map((item, idx) => (
            <View key={idx} style={styles.listRow}>
              <Text style={[styles.bullet, { color: colors.textSecondary }]}>•</Text>
              <Text style={[styles.listItem, { color: colors.text }]}>{renderInline(item)}</Text>
            </View>
          ))}
        </View>
      )
      continue
    }

    if (/^\d+\.\s/.test(line.trimStart())) {
      const items: string[] = []
      while (i < lines.length && /^\s*\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ''))
        i++
      }
      elements.push(
        <View key={key++} style={styles.list}>
          {items.map((item, idx) => (
            <View key={idx} style={styles.listRow}>
              <Text style={[styles.num, { color: colors.textSecondary }]}>{idx + 1}.</Text>
              <Text style={[styles.listItem, { color: colors.text }]}>{renderInline(item)}</Text>
            </View>
          ))}
        </View>
      )
      continue
    }

    if (line.trim() === '') {
      i++
      continue
    }

    const paraLines: string[] = []
    while (i < lines.length && lines[i].trim() !== '' && !/^(\s*)([-*]|\d+\.)\s/.test(lines[i]) && !lines[i].trimStart().startsWith('```') && !/^#{1,3}\s/.test(lines[i])) {
      paraLines.push(lines[i])
      i++
    }
    if (paraLines.length > 0) {
      const combined = paraLines.join(' ')
      elements.push(
        <Text key={key++} style={[styles.paragraph, { color: colors.text }]}>{renderInline(combined)}</Text>
      )
    }
  }

  function renderInline(t: string) {
    return parseInline(t).map((part, idx) => {
      if (typeof part === 'string') {
        return <Text key={idx}>{part}</Text>
      }
      if (part.bold) return <Text key={idx} style={styles.bold}>{part.bold}</Text>
      if (part.italic) return <Text key={idx} style={styles.italic}>{part.italic}</Text>
      if (part.code) return <Text key={idx} style={[styles.inlineCode, { backgroundColor: colors.surfaceContainerHigh, color: colors.primary }]}>{part.code}</Text>
      return null
    })
  }

  return <View>{elements}</View>
}

const styles = StyleSheet.create({
  paragraph: { fontSize: 14, lineHeight: 20, marginBottom: 8 },
  h3: { fontSize: 16, fontWeight: '700', marginTop: 12, marginBottom: 6 },
  bold: { fontWeight: '700' },
  italic: { fontStyle: 'italic' },
  inlineCode: { fontFamily: 'monospace', fontSize: 13, paddingHorizontal: 4, borderRadius: 4, overflow: 'hidden' },
  codeBlock: { borderRadius: 8, padding: 12, marginBottom: 8 },
  codeText: { fontFamily: 'monospace', fontSize: 13, lineHeight: 18 },
  list: { marginBottom: 8 },
  listRow: { flexDirection: 'row', marginBottom: 2 },
  bullet: { width: 16, fontSize: 14, lineHeight: 20 },
  num: { width: 20, fontSize: 14, lineHeight: 20 },
  listItem: { flex: 1, fontSize: 14, lineHeight: 20 },
})
