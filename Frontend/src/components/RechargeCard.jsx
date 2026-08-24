export default function RechargeCard({ onCall, onCancelCall, loading, status }) {
  return (
    <div className="bg-[#111215] border border-[#22242b] rounded-2xl p-6 space-y-4 shadow-xl font-sans h-fit">
      <div className="flex justify-between items-center border-b border-[#1c1e24] pb-3">
        <h2 className="text-xs font-extrabold uppercase tracking-widest text-zinc-300">Expiring Account Details</h2>
        <span className="text-[10px] font-mono bg-[#17181c] border border-[#262832] text-amber-400 px-2 py-0.5 rounded-md font-bold">
          EXPIRES TOMORROW
        </span>
      </div>

      <div className="space-y-2.5 text-xs text-zinc-400">
        <div className="flex justify-between py-1 border-b border-[#1c1e24]/60">
          <span className="text-zinc-500 font-mono">Customer:</span>
          <span className="text-white font-semibold">Vikas</span>
        </div>
        <div className="flex justify-between py-1 border-b border-[#1c1e24]/60">
          <span className="text-zinc-500 font-mono">Phone:</span>
          <span className="text-amber-400 font-mono font-bold">+91 9057262630</span>
        </div>
        <div className="flex justify-between py-1 border-b border-[#1c1e24]/60">
          <span className="text-zinc-500 font-mono">Current Plan:</span>
          <span className="text-zinc-300">100 Mbps Unlimited</span>
        </div>
        <div className="flex justify-between py-1 border-b border-[#1c1e24]/60">
          <span className="text-zinc-500 font-mono">Renewal Amount:</span>
          <span className="text-white font-bold">₹799</span>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onCall}
          disabled={loading}
          className="flex-1 bg-white hover:bg-zinc-200 text-black font-semibold py-3 px-4 rounded-xl transition-all text-xs tracking-wide shadow-md active:scale-98 cursor-pointer disabled:opacity-50"
        >
          {loading ? 'Initiating...' : 'Send Call'}
        </button>
        <button
          onClick={onCancelCall}
          className="bg-rose-600/90 hover:bg-rose-600 text-white font-semibold py-3 px-4 rounded-xl transition-all text-xs tracking-wide shadow-md active:scale-98 cursor-pointer"
        >
          Cancel Call
        </button>
      </div>

      {status && (
        <div className="p-3 bg-[#17181c] border border-[#262832] rounded-xl text-xs font-mono text-amber-400">
          {status}
        </div>
      )}
    </div>
  )
}
