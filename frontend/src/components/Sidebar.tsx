const links = [
  { icon: 'dashboard', label: 'Overview' },
  { icon: 'bar_chart', label: 'Analytics' },
  { icon: 'psychology', label: 'AI Insights' },
  { icon: 'description', label: 'Reporting' },
]

interface Props {
  open: boolean
  onClose: () => void
}

export default function Sidebar({ open, onClose }: Props) {
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
        <div className="mb-4 px-2">
          <h2 className="text-label-sm uppercase tracking-widest text-on-surface-variant font-bold mb-4">
            Analytics Engine
          </h2>
          <div className="flex flex-col gap-2">
            {links.map((l, i) => (
              <div
                key={l.label}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                  i === 0
                    ? 'bg-secondary-container text-primary font-bold'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined">{l.icon}</span>
                <span className="text-label-md">{l.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-auto px-2">
          <button className="w-full bg-primary text-on-primary py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all">
            <span className="material-symbols-outlined">add</span>
            New Analysis
          </button>
          <div className="mt-6 flex items-center gap-3 p-3 text-on-surface-variant hover:bg-surface-container-high rounded-lg cursor-pointer transition-all">
            <span className="material-symbols-outlined">contact_support</span>
            <span className="text-label-md">Support</span>
          </div>
        </div>
      </aside>
    </>
  )
}
