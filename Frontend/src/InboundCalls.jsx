import { useState } from 'react'
import ConversationStream from './components/ConversationStream'
import { useConversation } from './hooks/useConversation'
import { getApiUrl } from './api'

export default function InboundCalls() {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  const [activeOption, setActiveOption] = useState(null)
  const { logs, displayedTextMap, fetchLogs } = useConversation('/api/support/logs')

  const handleSimulateInbound = async () => {
    setLoading(true)
    setStatus('')
    setActiveOption(null)
    try {
      const res = await fetch(getApiUrl('/api/support'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Vikas', phone: '9057262630' })
      })
      const data = await res.json()
      setStatus(res.ok ? data.message || 'Support IVR Active!' : `Activation failed: ${data.message}`)
      if (res.ok) fetchLogs()
    } catch (err) {
      setStatus(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectOption = async (optionKey) => {
    setActiveOption(optionKey)
    try {
      const res = await fetch(getApiUrl('/api/support/option'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ option: optionKey, callerId: 'Customer (+91 9057262630)' })
      })
      const data = await res.json()
      if (res.ok) {
        setStatus(`Selected Option ${optionKey}: ${data.result?.title || 'Processed'}`)
        fetchLogs()
      } else {
        setStatus(`Option error: ${data.message}`)
      }
    } catch (err) {
      setStatus(`Option error: ${err.message}`)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-white tracking-tight">BCT Support Modular IVR</h1>
        <p className="text-xs text-zinc-400 mt-1">Interactive automated customer helpline & DTMF option handling.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#111215] border border-[#22242b] rounded-2xl p-6 space-y-5 shadow-xl font-sans h-fit">
          <div className="flex justify-between items-center border-b border-[#1c1e24] pb-3">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-zinc-300">Support IVR Config</h2>
            <span className="text-[10px] font-mono bg-[#17181c] border border-[#262832] text-cyan-400 px-2 py-0.5 rounded-md font-bold">
              MODULAR IVR
            </span>
          </div>

          <div className="space-y-2.5 text-xs text-zinc-400">
            <div className="flex justify-between py-1 border-b border-[#1c1e24]/60">
              <span className="text-zinc-500 font-mono">Greeting:</span>
              <span className="text-cyan-400 font-medium">"Welcome to BCT Support"</span>
            </div>
            <div className="py-1 border-b border-[#1c1e24]/60">
              <span className="text-zinc-500 font-mono block mb-2">Interactive Menu Options:</span>
              <div className="space-y-2">
                <button
                  onClick={() => handleSelectOption('1')}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                    activeOption === '1'
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                      : 'bg-[#17181c] border-[#262832] text-zinc-300 hover:border-cyan-500/50'
                  }`}
                >
                  <span className="font-bold font-mono px-2 py-0.5 bg-black/40 rounded border border-zinc-700">Key 1</span>
                  <span>Complaint Registration</span>
                </button>

                <button
                  onClick={() => handleSelectOption('2')}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                    activeOption === '2'
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                      : 'bg-[#17181c] border-[#262832] text-zinc-300 hover:border-cyan-500/50'
                  }`}
                >
                  <span className="font-bold font-mono px-2 py-0.5 bg-black/40 rounded border border-zinc-700">Key 2</span>
                  <span>New Connection Inquiry</span>
                </button>

                <button
                  onClick={() => handleSelectOption('3')}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                    activeOption === '3'
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                      : 'bg-[#17181c] border-[#262832] text-zinc-300 hover:border-cyan-500/50'
                  }`}
                >
                  <span className="font-bold font-mono px-2 py-0.5 bg-black/40 rounded border border-zinc-700">Key 3</span>
                  <span>Billing Details</span>
                </button>

                <button
                  onClick={() => handleSelectOption('4')}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                    activeOption === '4'
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                      : 'bg-[#17181c] border-[#262832] text-zinc-300 hover:border-cyan-500/50'
                  }`}
                >
                  <span className="font-bold font-mono px-2 py-0.5 bg-black/40 rounded border border-zinc-700">Key 4</span>
                  <span>Other Support Executive</span>
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleSimulateInbound}
              disabled={loading}
              className="w-full bg-white hover:bg-zinc-200 text-black font-semibold py-3 px-4 rounded-xl transition-all text-xs tracking-wide shadow-md active:scale-98 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Connecting...' : 'Activate Support IVR'}
            </button>
          </div>

          {status && (
            <div className="p-3 bg-[#17181c] border border-[#262832] rounded-xl text-xs font-mono text-cyan-400">
              {status}
            </div>
          )}
        </div>

        <ConversationStream logs={logs} displayedTextMap={displayedTextMap} />
      </div>
    </div>
  )
}
