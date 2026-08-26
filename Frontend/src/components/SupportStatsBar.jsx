import { TrendingUp, AlertCircle, Clock, CheckCircle } from 'lucide-react'

export default function SupportStatsBar({ stats = {} }) {
  const items = [
    { label: 'Total Calls',  value: stats.totalCalls ?? 24,         icon: TrendingUp,  accent: 'var(--text-primary)', iconBg: 'var(--accent-dim)',             iconColor: 'var(--text-primary)' },
    { label: 'Open',         value: stats.openComplaints ?? 2,       icon: AlertCircle, accent: '#ff6b6b',             iconBg: 'rgba(255,107,107,0.1)',         iconColor: '#ff6b6b' },
    { label: 'In Progress',  value: stats.inProgressComplaints ?? 1, icon: Clock,       accent: '#f5a623',             iconBg: 'rgba(245,166,35,0.1)',          iconColor: '#f5a623' },
    { label: 'Resolved',     value: stats.resolvedComplaints ?? 1,   icon: CheckCircle, accent: '#4ade80',             iconBg: 'rgba(74,222,128,0.1)',          iconColor: '#4ade80' },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {items.map((item, i) => {
        const Icon = item.icon
        return (
          <div key={i} className="cg-card px-4 py-4 flex items-start justify-between">
            <div className="space-y-2 min-w-0">
              <p className="forbes-label truncate">{item.label}</p>
              <p style={{ fontFamily: 'Manrope, sans-serif', color: item.accent, fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1 }}>
                {item.value}
              </p>
            </div>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ml-2"
              style={{ background: item.iconBg, border: '1px solid rgba(255,255,255,0.06)' }}>
              <Icon size={14} style={{ color: item.iconColor }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
