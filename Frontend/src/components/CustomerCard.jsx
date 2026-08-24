export default function CustomerCard({ customerName = 'Vikas', onCall, onCancelCall, loading, status, phoneInput, onPhoneChange }) {
  return (
    <div className="bg-[#111215] border border-[#22242b] rounded-2xl p-5 shadow-xl font-sans space-y-3.5">
      <div className="flex justify-between items-center border-b border-[#1c1e24] pb-3">
        <h2 className="text-xs font-extrabold uppercase tracking-widest text-zinc-200">Target Profile</h2>
        {status && (
          <span className="text-zinc-300 font-mono text-[10px] font-bold truncate max-w-[180px]">
            {status}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 bg-[#17181c] border border-[#262832] p-3 rounded-xl">
        <span className="text-white font-bold text-xs truncate max-w-[120px] sm:max-w-[150px] shrink-0" title={customerName}>
          {customerName}
        </span>

        <input
          type="text"
          value={phoneInput}
          onChange={(e) => onPhoneChange(e.target.value)}
          className="bg-[#111215] border border-[#262832] text-white font-mono font-bold px-3 py-1 rounded-lg text-xs w-28 text-right focus:outline-none focus:border-white"
        />

        <div className="flex gap-2 shrink-0">
          <button
            onClick={onCall}
            disabled={loading}
            className="bg-white hover:bg-zinc-200 text-black font-extrabold py-1.5 px-3.5 rounded-xl transition-all text-xs tracking-wide shadow-md active:scale-98 cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Dialing...' : 'Call'}
          </button>

          {onCancelCall && (
            <button
              onClick={onCancelCall}
              className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-1.5 px-3 rounded-xl transition-all text-xs cursor-pointer border border-zinc-700 shadow-md active:scale-98"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
