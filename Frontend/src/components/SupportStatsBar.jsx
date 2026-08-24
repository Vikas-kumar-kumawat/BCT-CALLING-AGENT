export default function SupportStatsBar({ stats = {} }) {
  const statItems = [
    { label: 'TOTAL CALLS', value: stats.totalCalls || 24, color: 'text-white' },
    { label: 'OPEN COMPLAINTS', value: stats.openComplaints || 2, color: 'text-rose-400' },
    { label: 'IN PROGRESS', value: stats.inProgressComplaints || 1, color: 'text-amber-400' },
    { label: 'RESOLVED', value: stats.resolvedComplaints || 1, color: 'text-emerald-400' }
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-sans">
      {statItems.map((item, idx) => (
        <div 
          key={idx} 
          className="bg-[#111215] border border-[#22242b] rounded-2xl p-4 shadow-md flex items-center justify-between"
        >
          <div className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400">
            {item.label}
          </div>
          <div className={`text-xl font-extrabold font-mono ${item.color}`}>
            {item.value}
          </div>
        </div>
      ))}
    </div>
  )
}
