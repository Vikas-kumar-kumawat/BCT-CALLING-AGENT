import { PhoneCall, CreditCard, Sparkles, Headphones, ArrowUpRight } from 'lucide-react'

const modules = [
  { id: 'feedback',  title: 'Feedback Calls',    icon: PhoneCall },
  { id: 'recharge',  title: 'Recharge Reminder', icon: CreditCard },
  { id: 'promotion', title: 'Plan Promotion',     icon: Sparkles },
  { id: 'inbound',   title: 'Customer Support',  icon: Headphones },
]

export default function Home({ onNavigate }) {
  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* Header */}
      <div className="pb-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <h1
          style={{
            fontFamily: 'Manrope, sans-serif',
            color: 'var(--text-primary)',
            fontSize: 'clamp(28px, 5vw, 36px)',
            fontWeight: 900,
            letterSpacing: '-0.03em'
          }}
        >
          Command Center
        </h1>
      </div>

      {/* Module Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {modules.map((mod) => {
          const Icon = mod.icon
          return (
            <button
              key={mod.id}
              onClick={() => onNavigate(mod.id)}
              className="cg-card-hover group text-left w-full cursor-pointer flex items-center justify-between p-6"
            >
              <div className="flex items-center gap-4">
                {/* Icon */}
                <div
                  className="rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110"
                  style={{
                    width: '44px',
                    height: '44px',
                    minWidth: '44px',
                    background: 'var(--accent-dim)',
                    border: '1px solid var(--accent-border)'
                  }}
                >
                  <Icon size={20} style={{ color: 'var(--accent)' }} />
                </div>

                {/* Title */}
                <h2
                  className="font-bold transition-colors group-hover:text-[var(--accent)]"
                  style={{
                    color: 'var(--text-primary)',
                    fontSize: '17px',
                    fontWeight: 700,
                    letterSpacing: '-0.01em'
                  }}
                >
                  {mod.title}
                </h2>
              </div>

              {/* Arrow */}
              <div
                className="rounded-lg flex items-center justify-center shrink-0 transition-all duration-300 group-hover:bg-[var(--accent)] group-hover:border-[var(--accent)]"
                style={{
                  width: '32px',
                  height: '32px',
                  minWidth: '32px',
                  border: '1px solid var(--border-subtle)',
                  background: 'transparent'
                }}
              >
                <ArrowUpRight
                  size={15}
                  style={{ color: 'var(--text-muted)' }}
                  className="group-hover:text-white transition-colors"
                />
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
