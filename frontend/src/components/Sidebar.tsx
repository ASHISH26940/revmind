import type { Tab } from '../App'

const links: { icon: string; label: string; tab: Tab }[] = [
  { icon: 'dashboard', label: 'Overview', tab: 'dashboard' },
  { icon: 'psychology', label: 'AI Insights', tab: 'chat' },
]

interface Props {
  open: boolean
  onClose: () => void
  tab: Tab
  onTabChange: (t: Tab) => void
}

export default function Sidebar({ open, onClose, tab, onTabChange }: Props) {
  function handleClick(t: Tab) {
    onTabChange(t)
    onClose()
  }

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onClose} />
      )}
      <aside
        className={`h-screen w-64 fixed left-0 top-0 border-r border-surface-container-highest bg-surface-container flex flex-col p-stack-md gap-stack-sm pt-16 transition-all duration-300 z-50 ${
          open ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 ${open ? 'md:flex' : 'md:hidden'}`}
      >
        <div className="flex items-center justify-between px-2 pb-2">
          <span className="text-title-lg font-headline-lg text-primary">NovaBite BI</span>
          <button onClick={onClose} className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
            close
          </button>
        </div>
        <div className="flex flex-col gap-2 px-2">
          {links.map((l) => (
            <div
              key={l.label}
              onClick={() => handleClick(l.tab)}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                tab === l.tab
                  ? 'bg-secondary-container text-primary font-bold'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <span className="material-symbols-outlined">{l.icon}</span>
              <span className="text-label-md">{l.label}</span>
            </div>
          ))}
        </div>
      </aside>
    </>
  )
}
