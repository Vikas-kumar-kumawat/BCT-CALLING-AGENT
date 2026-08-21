export default function MetricCards({ callsCount = 1, feedbackCount = 1 }) {
  const metrics = [
    { label: 'CALLS EXECUTED', value: `${callsCount}`, badge: '+18%' },
    { label: 'FEEDBACKS COLLECTED', value: `${feedbackCount}`, badge: '+12%' },
    { label: 'POSITIVE SENTIMENT', value: '0%', badge: '+8%' },
    { label: 'NEGATIVE SENTIMENT', value: '0%', badge: '-5%' },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {metrics.map((m, i) => (
        <div key={i} className="bg-[#111215] border border-[#22242b] rounded-2xl p-5 space-y-3 shadow-xl">
          <div className="flex justify-between items-center">
            <span className="text-xs font-extrabold uppercase tracking-widest text-zinc-300">
              {m.label}
            </span>
            <span className="text-[10px] font-mono bg-[#17181c] border border-[#262832] text-zinc-300 px-2 py-0.5 rounded-md font-bold">
              {m.badge}
            </span>
          </div>
          <div className="text-3xl font-extrabold text-white tracking-tight">
            {m.value}
          </div>
        </div>
      ))}
    </div>
  )
}
