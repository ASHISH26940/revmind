import { useState, useRef, useCallback } from 'react'
import { View, Text, TextInput, TouchableOpacity, ScrollView, RefreshControl, useColorScheme, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { MaterialIcons } from '@expo/vector-icons'
import { scale, verticalScale } from 'react-native-size-matters'
import { Colors } from '@/constants/theme'
import { streamChat } from '@/api'
import Markdown from '@/components/Markdown'

const INITIAL_MESSAGE = { role: 'ai', text: 'Hello! I am your NovaBite BI Intelligence agent. Ask me about your sales data — regions, categories, trends, anything.' }

export default function Chat() {
  const scheme = useColorScheme()
  const colors = Colors[scheme ?? 'dark']
  const insets = useSafeAreaInsets()
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([INITIAL_MESSAGE])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const scrollRef = useRef<ScrollView>(null)

  const handleSend = useCallback(async () => {
    const q = input.trim()
    if (!q || loading) return
    setInput('')
    setLoading(true)
    setMessages(prev => [...prev, { role: 'user', text: q }, { role: 'ai', text: '' }])

    const history = messages
      .slice(1)
      .filter(m => m.text)
      .map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.text }))

    let acc = ''
    try {
      for await (const chunk of streamChat(q, history)) {
        acc += chunk
        setMessages(prev => {
          const copy = [...prev]
          copy[copy.length - 1] = { role: 'ai', text: acc }
          return copy
        })
      }
    } catch {
      setMessages(prev => {
        const copy = [...prev]
        copy[copy.length - 1] = { role: 'ai', text: 'Error: failed to get response.' }
        return copy
      })
    } finally {
      setLoading(false)
    }
  }, [input, loading])

  const handleRefresh = useCallback(() => {
    setRefreshing(true)
    setMessages([INITIAL_MESSAGE])
    setInput('')
    setRefreshing(false)
  }, [])

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView ref={scrollRef} style={styles.scroll} contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + scale(8) }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}>
        {messages.map((m, i) => (
          <View key={i} style={[styles.row, m.role === 'user' ? styles.userRow : styles.aiRow]}>
            {m.role === 'ai' && (
              <View style={[styles.avatar, { backgroundColor: colors.primaryContainer }]}>
                <MaterialIcons name="auto-awesome" size={scale(16)} color={colors.primary} />
              </View>
            )}
            <View style={[styles.bubble, m.role === 'user' ? styles.userBubble : styles.aiBubble,
            { backgroundColor: m.role === 'user' ? colors.primaryContainer : colors.surfaceContainer }]}>
              {m.role === 'ai' && m.text ? (
                <Markdown text={m.text} colors={colors} />
              ) : (
                <Text style={[styles.bubbleText, { color: colors.text }]}>{m.text || (i === messages.length - 1 && loading ? '...' : '')}</Text>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={[styles.inputRow, { backgroundColor: colors.surfaceContainer, borderColor: colors.outline }]}>
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="Type your question..."
          placeholderTextColor={colors.textSecondary}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={handleSend}
          editable={!loading}
        />
        <TouchableOpacity onPress={handleSend} disabled={loading || !input.trim()}
          style={[styles.sendBtn, { backgroundColor: colors.primary, opacity: loading || !input.trim() ? 0.5 : 1 }]}>
          <MaterialIcons name="send" size={scale(18)} color={colors.background} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: scale(16), paddingBottom: verticalScale(16) },
  row: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: verticalScale(8), gap: scale(8) },
  userRow: { justifyContent: 'flex-end' },
  aiRow: { justifyContent: 'flex-start' },
  avatar: { width: scale(28), height: scale(28), borderRadius: scale(14), alignItems: 'center', justifyContent: 'center' },
  bubble: { borderRadius: scale(12), padding: scale(12), maxWidth: '75%' },
  userBubble: { alignSelf: 'flex-end' },
  aiBubble: { alignSelf: 'flex-start' },
  bubbleText: { fontSize: scale(14), lineHeight: scale(20) },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, padding: scale(12), gap: scale(8) },
  input: { flex: 1, fontSize: scale(14), paddingVertical: scale(8) },
  sendBtn: {
    borderRadius: scale(10),
    paddingHorizontal: scale(12),
    paddingVertical: scale(10),
  },
})
