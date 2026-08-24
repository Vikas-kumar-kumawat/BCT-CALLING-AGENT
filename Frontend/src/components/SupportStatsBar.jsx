import { TrendingUp, AlertCircle, Clock, CheckCircle } from 'lucide-react'

export default function SupportStatsBar({ stats = {} }) {
  const items = [
    { label: 'Total Calls',  value: stats.totalCalls ?? 24,             icon: TrendingUp,  accent: 'var(--text-primary)', iconBg: 'var(--row-hover)' },
    { label: 'Open',         value: stats.openComplaints ?? 2,           icon: AlertCircle, accent: '#C01048',             iconBg: 'rgba(224,0,0,0.06)' },
    { label: 'In Progress',  value: stats.inProgressComplaints ?? 1,     icon: Clock,       accent: '#B54708',             iconBg: 'rgba(245,158,11,0.08)' },
    { label: 'Resolved',     value: stats.resolvedComplaints ?? 1,       icon: CheckCircle, accent: '#027A48',             iconBg: 'rgba(16,185,129,0.08)' },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {items.map((item, i) => {
        const Icon = item.icon
        return (
          <div key={i} className="cg-card px-4 py-4 flex items-start justify-between">
            <div className="space-y-1 min-w-0">
              <p className="forbes-label truncate">{item.label}</p>
              <p style={{ fontFamily: "'Source Serif 4', serif", color: item.accent, fontSize: 'clamp(24px, 5vw, 30px)', fontWeight: 700, lineHeight: 1 }}>
                {item.value}
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ml-2" style={{ background: item.iconBg, border: '1px solid var(--border-subtle)' }}>
              <Icon size={14} style={{ color: item.accent }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
