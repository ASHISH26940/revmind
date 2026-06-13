import type { Tab } from '../App'

export default function Fab({ tab }: { tab: Tab }) {
  if (tab !== 'dashboard') return null

  return (
    <button className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-on-primary rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40">
      <span className="material-symbols-outlined text-[28px]">insights</span>
    </button>
  )
}
