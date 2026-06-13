import { useState, useRef } from 'react'

export default function Chat() {
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([
    { role: 'ai', text: 'Hello! I am your NovaBite BI Intelligence agent. Ask me about your sales data — regions, categories, trends, anything.' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  async function handleSubmit() {
    const q = input.trim()
    if (!q || loading) return
    setInput('')

    setMessages((prev) => [...prev, { role: 'user', text: q }])
    setLoading(true)

    setMessages((prev) => [...prev, { role: 'ai', text: '' }])

    try {
      const ctrl = new AbortController()
      abortRef.current = ctrl
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q }),
        signal: ctrl.signal,
      })
      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let acc = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        acc += decoder.decode(value, { stream: true })
        setMessages((prev) => {
          const copy = [...prev]
          copy[copy.length - 1] = { role: 'ai', text: acc }
          return copy
        })
      }
    } catch {
      setMessages((prev) => {
        const copy = [...prev]
        copy[copy.length - 1] = { role: 'ai', text: 'Error: failed to get response.' }
        return copy
      })
    } finally {
      setLoading(false)
      abortRef.current = null
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
    }
  }

  return (
    <section className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-primary/20 rounded-2xl">
          <span className="material-symbols-outlined text-primary text-[32px]">psychology</span>
        </div>
        <div>
          <h1 className="font-headline-md text-headline-md text-on-surface">NovaBite AI Assistant</h1>
          <p className="text-body-md text-on-surface-variant">Ask complex queries about your business data.</p>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto mb-6 pr-4 space-y-6 hide-scrollbar" id="chat-messages">
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex gap-4'}>
            {m.role === 'ai' && (
              <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[18px] text-primary">smart_toy</span>
              </div>
            )}
            <div
              className={`rounded-xl p-4 text-body-md max-w-[85%] whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'bg-primary/10 border border-primary/20 text-on-surface'
                  : 'bg-surface-container border border-surface-container-highest text-on-surface-variant'
              }`}
            >
              {m.text || (i === messages.length - 1 && loading ? (
                <div className="flex gap-1 items-center">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full dot-pulse" style={{ animationDelay: '0s' }} />
                  <div className="w-1.5 h-1.5 bg-primary rounded-full dot-pulse" style={{ animationDelay: '0.2s' }} />
                  <div className="w-1.5 h-1.5 bg-primary rounded-full dot-pulse" style={{ animationDelay: '0.4s' }} />
                </div>
              ) : null)}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="relative group">
        <input
          className="w-full bg-surface-container border border-surface-container-highest rounded-2xl py-5 px-6 pr-32 text-on-surface focus:border-primary focus:ring-0 transition-all duration-300 outline-none shadow-xl"
          placeholder="Type your strategic question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          disabled={loading}
        />
        <button
          onClick={handleSubmit}
          disabled={loading || !input.trim()}
          className="absolute right-3 top-3 bottom-3 bg-primary text-on-primary px-6 rounded-xl font-bold hover:opacity-90 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          Ask
          <span className="material-symbols-outlined text-[20px]">send</span>
        </button>
      </div>

      <div className="mt-4 flex justify-center gap-6">
        <button
          onClick={() => { setInput('What was the best performing product in the West region?') }}
          className="text-label-sm text-on-surface-variant hover:text-primary flex items-center gap-1 transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">lightbulb</span>
          Best product in West
        </button>
        <button
          onClick={() => { setInput('Compare E-Commerce vs Modern Trade net revenue.') }}
          className="text-label-sm text-on-surface-variant hover:text-primary flex items-center gap-1 transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">compare_arrows</span>
          E-Commerce vs Trade
        </button>
      </div>
    </section>
  )
}
