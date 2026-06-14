import { fetch } from 'expo/fetch'
import type { SummaryData, TrendDataPoint } from './types'

// In development, use your machine's local IP.
// For Expo Go on a physical device, replace with your computer's LAN IP.
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000'

export async function fetchSummary(): Promise<SummaryData> {
  const res = await fetch(`${BASE_URL}/api/summary`)
  const body = await res.json()
  return body.data
}

export async function fetchTrends(): Promise<TrendDataPoint[]> {
  const res = await fetch(`${BASE_URL}/api/trends`)
  const body = await res.json()
  return body.data
}

export async function* streamChat(question: string, history: { role: string; content: string }[] = []): AsyncGenerator<string> {
  const res = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, history }),
  })
  const reader = res.body!.getReader()
  const decoder = new TextDecoder()
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    yield decoder.decode(value, { stream: true })
  }
}
