import { useEffect, useRef } from 'react'

export default function ConversationStream({ logs = [], displayedTextMap = {}, selectedCustomer, isLiveCall, status = '' }) {
  const scrollContainerRef = useRef(null)

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight
    }
  }, [logs, displayedTextMap])

  const hasPastFeedback = selectedCustomer?.feedback &&
    selectedCustomer.feedback !== 'No feedback yet.' &&
    !selectedCustomer.feedback.startsWith('(')

  // Construct past conversation entries if no live call logs exist but past feedback exists
  const pastLogs = hasPastFeedback ? [
    {
      id: 'past-1',
      sender: 'agent',
      speaker: 'Voice Agent',
      text: 'Hello sir, main BCT fibernet se baat kar rahi hu. Feedback ke regarding call tha ki aapka internet kaisa chal raha hai?',
      timestamp: 'Past Call'
    },
    {
      id: 'past-2',
      sender: 'customer',
      speaker: selectedCustomer.name || 'Customer',
      text: selectedCustomer.feedback,
      timestamp: 'Past Call'
    },
    {
      id: 'past-3',
      sender: 'agent',
      speaker: 'Voice Agent',
      text: 'Aapka feedback dene ke liye dhanyawad. Aapka din shubh ho.',
      timestamp: 'Past Call'
    }
  ] : []

  // If live logs exist OR a call is actively taking place, show live stream!
  const isDisplayingLive = (logs && logs.length > 0) || isLiveCall
  const isPastRecord = !isDisplayingLive && hasPastFeedback
  const displayLogs = isDisplayingLive ? logs : pastLogs

  return (
    <div className="bg-[#111215] border border-[#22242b] rounded-2xl p-5 shadow-xl flex flex-col h-[510px] font-sans">
      {/* Stream Header in Strict B&W */}
      <div className="flex justify-between items-center border-b border-[#1c1e24] pb-3 mb-4">
        <div className="flex items-center gap-2">
          {isDisplayingLive ? (
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
            </span>
          ) : isPastRecord ? (
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-400"></span>
          ) : (
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-600"></span>
          )}

          <h2 className="text-xs font-extrabold uppercase tracking-widest text-zinc-200">
            {isDisplayingLive ? 'Live Conversation Stream' : isPastRecord ? 'Past Conversation History' : 'Conversation Stream'}
          </h2>
        </div>

        <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-md border ${
          isDisplayingLive
            ? 'text-white bg-white/10 border-white/20'
            : isPastRecord
            ? 'text-zinc-300 bg-zinc-800 border-zinc-700'
            : 'text-zinc-500 bg-[#17181c] border-[#262832]'
        }`}>
          {isDisplayingLive ? 'LIVE SESSION' : isPastRecord ? 'PAST RECORD' : 'NO RECORD'}
        </span>
      </div>

      {/* Notice Banner for Past Record in B&W */}
      {isPastRecord && (
        <div className="mb-3 px-3 py-1.5 bg-[#17181c] border border-zinc-700 rounded-lg text-[10px] font-mono text-zinc-300 flex justify-between items-center shrink-0">
          <span>📜 Showing previous recorded session for {selectedCustomer?.name}</span>
          <span className="text-zinc-400 font-bold uppercase">ARCHIVED</span>
        </div>
      )}

      {/* Stream Messages Container - Strict Black & White styling */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto space-y-3 pr-2 scroll-smooth text-xs custom-scrollbar"
      >
        {displayLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500 space-y-2">
            <div className="w-10 h-10 rounded-full bg-[#17181c] border border-[#262832] flex items-center justify-center text-zinc-500 text-sm font-mono">
              💬
            </div>
            <p className="text-center font-mono text-xs text-zinc-500 max-w-xs">
              NO CALL RECORD FOR {selectedCustomer?.name?.toUpperCase() || 'THIS CUSTOMER'} // CLICK CALL TO START
            </p>
          </div>
        ) : (
          displayLogs.map((log) => {
            const logId = log.id || log.text
            const displayedText = isDisplayingLive ? (displayedTextMap[logId] ?? log.text) : log.text
            const isTyping = isDisplayingLive && displayedText.length < (log.text || '').length

            return (
              <div key={logId} className={`flex flex-col ${log.sender === 'agent' ? 'items-start' : 'items-end'}`}>
                <div className="text-[10px] font-mono text-zinc-400 mb-1">
                  <span className={`font-bold uppercase ${log.sender === 'agent' ? 'text-white' : 'text-zinc-400'}`}>
                    {log.speaker || (log.sender === 'agent' ? 'VOICE AGENT' : 'CUSTOMER')}
                  </span>
                  <span> • {log.timestamp}</span>
                </div>
                <div
                  className={`max-w-[88%] p-3 rounded-xl text-xs leading-relaxed border ${
                    log.sender === 'agent'
                      ? 'bg-[#17181c] text-white border-[#262832]'
                      : 'bg-[#22242b] text-zinc-100 border-[#323642]'
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
      </div>
    </div>
  )
}
