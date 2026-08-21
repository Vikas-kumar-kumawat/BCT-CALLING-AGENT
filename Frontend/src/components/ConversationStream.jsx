import { useEffect, useRef } from 'react'

export default function ConversationStream({ logs, displayedTextMap }) {
  const chatEndRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs, displayedTextMap])

  return (
    <div className="bg-[#111215] border border-[#22242b] rounded-2xl p-6 shadow-xl flex flex-col h-[440px] font-sans">
      <div className="flex justify-between items-center border-b border-[#1c1e24] pb-3 mb-4">
        <h2 className="text-xs font-extrabold uppercase tracking-widest text-zinc-300">Live Conversation Stream</h2>
        <span className="text-[10px] font-mono text-zinc-400 bg-[#17181c] border border-[#262832] px-2.5 py-1 rounded-md font-bold">
          {logs.length} MESSAGES
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2 scroll-smooth text-xs">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500 space-y-2">
            <p className="text-center font-mono text-xs text-zinc-500">NO ACTIVE CALL // CLICK INITIATE CALL TO START STREAM</p>
          </div>
        ) : (
          logs.map((log) => {
            const logId = log.id || log.text
            const displayedText = displayedTextMap[logId] ?? log.text
            const isTyping = displayedText.length < (log.text || '').length

            return (
              <div key={logId} className={`flex flex-col ${log.sender === 'agent' ? 'items-start' : 'items-end'}`}>
                <div className="text-[10px] font-mono text-zinc-400 mb-1">
                  <span className={`font-bold uppercase ${log.sender === 'agent' ? 'text-emerald-400' : 'text-cyan-400'}`}>
                    {log.speaker || (log.sender === 'agent' ? 'VOICE AGENT' : 'CUSTOMER')}
                  </span>
                  <span> • {log.timestamp}</span>
                </div>
                <div
                  className={`max-w-[86%] p-3.5 rounded-xl text-xs leading-relaxed border ${
                    log.sender === 'agent'
                      ? 'bg-[#17181c] text-zinc-100 border-[#262832]'
                      : 'bg-[#1b1915] text-zinc-100 border-[#382f22]'
                  }`}
                >
                  <p>
                    {displayedText}
                    {isTyping && <span className="inline-block w-1.5 h-3 ml-1 bg-white animate-pulse"></span>}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={chatEndRef} />
      </div>
    </div>
  )
}
