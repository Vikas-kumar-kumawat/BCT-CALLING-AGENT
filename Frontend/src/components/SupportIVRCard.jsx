export default function SupportIVRCard({ activeOption, onSelectOption }) {
  const options = [
    { key: '1', label: '1: Complaint' },
    { key: '2', label: '2: New Conn' },
    { key: '3', label: '3: Billing' },
    { key: '4', label: '4: Support' }
  ]

  return (
    <div className="flex items-center gap-2 bg-[#111215] border border-[#22242b] px-3 py-1.5 rounded-xl shadow-sm font-sans w-fit">
      <span className="text-[10px] font-mono text-zinc-500 font-extrabold uppercase tracking-widest shrink-0">
        DTMF:
      </span>
      <div className="flex items-center gap-1.5">
        {options.map((opt) => (
          <button
            key={opt.key}
            onClick={() => onSelectOption(opt.key)}
            className={`px-2 py-0.5 rounded-md border text-[10px] font-mono font-bold transition-all cursor-pointer ${
              activeOption === opt.key
                ? 'bg-white text-black border-white shadow-sm'
                : 'bg-[#17181c] border-[#262832] text-zinc-400 hover:border-zinc-500 hover:text-white'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
