import { useState } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import Chat from './components/Chat'
import Fab from './components/Fab'

export type Tab = 'dashboard' | 'chat'

export default function App() {
  const [tab, setTab] = useState<Tab>('dashboard')

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Header tab={tab} onTabChange={setTab} />
      <Sidebar />
      <main className="md:ml-64 pt-16 px-page-margin pb-12 transition-all duration-300">
        {tab === 'dashboard' ? <Dashboard /> : <Chat />}
      </main>
      <Fab tab={tab} />
    </div>
  )
}
