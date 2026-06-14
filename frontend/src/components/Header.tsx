import type { Tab } from '../App'

interface Props {
  tab: Tab
  onTabChange: (t: Tab) => void
  onToggleSidebar: () => void
  sidebarOpen: boolean
}

const btn = (active: boolean) =>
  `px-6 py-1.5 rounded-md font-label-md text-label-md transition-all duration-200 ${
    active ? 'bg-secondary-container text-on-surface' : 'text-on-surface-variant hover:text-on-surface'
  }`

export default function Header({ tab, onTabChange, onToggleSidebar, sidebarOpen }: Props) {
  return (
    <header className="fixed top-0 w-full z-50 border-b border-surface-container-highest backdrop-blur-md bg-surface/80 h-16 flex items-center px-page-margin">
      <div className="flex items-center gap-4 shrink-0">
        <button
          onClick={onToggleSidebar}
          className="material-symbols-outlined p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-all cursor-pointer leading-none flex items-center justify-center"
          title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          {sidebarOpen ? 'menu_open' : 'dock_to_left'}
        </button>
        <span className="text-title-lg font-headline-lg text-primary pt-1">NovaBite BI</span>
      </div>
      <nav className="flex-1 flex justify-center">
        <div className="flex items-center bg-surface-container-lowest p-1 rounded-lg border border-outline-variant">
          <button className={btn(tab === 'dashboard')} onClick={() => onTabChange('dashboard')}>
            Dashboard
          </button>
          <button className={btn(tab === 'chat')} onClick={() => onTabChange('chat')}>
            Chat
          </button>
        </div>
      </nav>
    </header>
  )
}
