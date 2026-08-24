import { PhoneCall, CreditCard, Sparkles, Headphones, ArrowUpRight } from 'lucide-react'

const modules = [
  { id: 'feedback',  title: 'Feedback Calls',    icon: PhoneCall  },
  { id: 'recharge',  title: 'Recharge Reminder', icon: CreditCard },
  { id: 'promotion', title: 'Plan Promotion',     icon: Sparkles   },
  { id: 'inbound',   title: 'Customer Support',  icon: Headphones },
]

export default function Home({ onNavigate }) {
  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Page Header */}
      <div className="pb-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <h1 style={{ fontFamily: "'Source Serif 4', serif", color: 'var(--text-primary)', fontSize: 'clamp(22px, 5vw, 28px)', fontWeight: 700, letterSpacing: '-0.02em' }}>
          Command Center
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
          Select an AI module to start a campaign or manage support.
        </p>
      </div>

      {/* Module Grid — 1 col on mobile, 2 col on md+ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {modules.map((mod) => {
          const Icon = mod.icon
          return (
            <button
              key={mod.id}
              onClick={() => onNavigate(mod.id)}
              className="cg-card-hover group text-left w-full cursor-pointer flex items-center justify-between"
              style={{ padding: 'clamp(14px, 3vw, 20px)' }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="rounded-lg flex items-center justify-center shrink-0 transition-all duration-200 group-hover:bg-[#e00000]"
                  style={{ width: '40px', height: '40px', minWidth: '40px', background: 'rgba(224,0,0,0.08)', border: '1px solid rgba(224,0,0,0.12)' }}
                >
                  <Icon size={18} className="text-[#e00000] group-hover:text-white transition-colors duration-200" />
                </div>
                <h2
                  className="font-semibold group-hover:text-[#e00000] transition-colors truncate"
                  style={{ fontFamily: "'Source Serif 4', serif", color: 'var(--text-primary)', fontSize: 'clamp(14px, 3vw, 16px)' }}
                >
                  {mod.title}
                </h2>
              </div>
              <div
                className="rounded-md flex items-center justify-center transition-all duration-200 group-hover:bg-[#e00000] shrink-0 ml-2"
                style={{ width: '32px', height: '32px', minWidth: '32px', background: 'var(--row-hover)', border: '1px solid var(--border-subtle)' }}
              >
                <ArrowUpRight size={14} style={{ color: 'var(--text-muted)' }} className="group-hover:text-white transition-colors" />
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
