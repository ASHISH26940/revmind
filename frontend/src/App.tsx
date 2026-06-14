import { useState } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import Chat from './components/Chat'
export type Tab = 'dashboard' | 'chat'

export default function App() {
  const [tab, setTab] = useState<Tab>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Header tab={tab} onTabChange={setTab} onToggleSidebar={() => setSidebarOpen((s) => !s)} sidebarOpen={sidebarOpen} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} tab={tab} onTabChange={setTab} />
      <main className={`pt-16 px-page-margin pb-12 transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'md:ml-0'}`}>
        {tab === 'dashboard' ? <Dashboard /> : <Chat />}
      </main>
    </div>
  )
}
