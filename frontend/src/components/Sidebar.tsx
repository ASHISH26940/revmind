const links = [
  { icon: 'dashboard', label: 'Overview' },
  { icon: 'bar_chart', label: 'Analytics' },
  { icon: 'psychology', label: 'AI Insights' },
  { icon: 'description', label: 'Reporting' },
]

export default function Sidebar() {
  return (
    <aside className="h-screen w-64 fixed left-0 top-0 border-r border-surface-container-highest bg-surface-container flex flex-col p-stack-md gap-stack-sm pt-20 hidden md:flex">
      <div className="mb-8 px-2">
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
  )
}
