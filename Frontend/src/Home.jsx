export default function Home({ onNavigate }) {
  const options = [
    { id: 'feedback', label: 'FEEDBACK AGENT', icon: '📞', desc: 'Automated customer satisfaction survey & speech analytics bot.' },
    { id: 'recharge', label: 'RECHARGE REMINDER', icon: '💳', desc: 'Broadband plan expiry recall & instant payment link engine.' },
    { id: 'promotion', label: 'PLAN PROMOTION', icon: '🚀', desc: 'High-speed 300 Mbps fiber upgrade & OTT bundle promotion.' },
    { id: 'inbound', label: 'CUSTOMER SUPPORT IVR', icon: '📥', desc: 'Inbound technical helpline & automated router reset assistant.' },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">DASHBOARD</h1>
        <p className="text-xs text-zinc-400 mt-1">Select a voice AI agent service below to manage live campaigns.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onNavigate(opt.id)}
            className="bg-[#111215] hover:bg-[#17181c] border border-[#22242b] hover:border-[#323642] rounded-2xl p-6 text-left transition-all space-y-3 group cursor-pointer shadow-xl"
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl">{opt.icon}</span>
              <span className="text-xs font-bold text-zinc-400 group-hover:text-white transition-all">Launch →</span>
            </div>
            <div>
              <h2 className="text-xs font-extrabold uppercase tracking-widest text-zinc-200 group-hover:text-emerald-400 transition-all">
                {opt.label}
              </h2>
              <p className="text-xs font-normal text-zinc-400 mt-1 leading-relaxed">{opt.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
