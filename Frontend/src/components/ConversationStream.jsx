import { useEffect, useRef } from 'react'
import { Mic, Archive } from 'lucide-react'

export default function ConversationStream({ logs = [], displayedTextMap = {}, selectedCustomer, isLiveCall, status = '' }) {
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [logs, displayedTextMap])

  const hasPastFeedback = selectedCustomer?.feedback &&
    selectedCustomer.feedback !== 'No feedback yet.' &&
    !selectedCustomer.feedback.startsWith('(')

  const pastLogs = hasPastFeedback ? [
    { id: 'p1', sender: 'agent',    speaker: 'Voice Agent', text: 'Hello sir, main BCT fibernet se baat kar rahi hu. Aapka internet kaisa chal raha hai?', timestamp: 'Past Call' },
    { id: 'p2', sender: 'customer', speaker: selectedCustomer?.name || 'Customer', text: selectedCustomer?.feedback, timestamp: 'Past Call' },
    { id: 'p3', sender: 'agent',    speaker: 'Voice Agent', text: 'Aapka feedback ke liye dhanyawad. Aapka din shubh ho.', timestamp: 'Past Call' },
  ] : []

  const isLive   = (logs?.length > 0) || isLiveCall
  const isPast   = !isLive && hasPastFeedback
  const dispLogs = isLive ? logs : pastLogs

  return (
    <div className="cg-card flex flex-col overflow-hidden" style={{ height: '520px', maxHeight: 'calc(100vh - 180px)' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center gap-2">
          {isLive ? (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full" style={{ background: 'var(--live-accent)', opacity: 0.45 }} />
              <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: 'var(--live-accent)' }} />
            </span>
          ) : (
            <span className="h-2 w-2 rounded-full" style={{ background: 'var(--border-subtle)' }} />
          )}
          <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: isLive ? 'var(--live-accent)' : 'var(--text-muted)' }}>
            {isLive ? 'Live Session' : isPast ? 'Past Record' : 'Conversation'}
          </p>
        </div>
        <span
          className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
          style={isLive
            ? { background: 'var(--live-accent)', color: '#fff' }
            : { color: 'var(--text-muted)', border: '1px solid var(--border-subtle)', background: 'transparent' }
          }
        >
          {isLive ? 'LIVE' : isPast ? 'ARCHIVED' : 'IDLE'}
        </span>
      </div>

      {/* Past record notice */}
      {isPast && (
        <div className="flex items-center gap-2 px-4 py-2 shrink-0" style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--row-hover)' }}>
          <Archive size={11} style={{ color: 'var(--text-muted)' }} />
          <span className="text-[10px] uppercase tracking-wider font-semibold truncate" style={{ color: 'var(--text-muted)' }}>
            Archived — {selectedCustomer?.name}
          </span>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3 custom-scrollbar">
        {dispLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--row-hover)', border: '1px solid var(--border-subtle)' }}>
              <Mic size={16} style={{ color: 'var(--text-muted)' }} />
            </div>
            <p className="text-[11px] uppercase tracking-widest text-center" style={{ color: 'var(--text-muted)' }}>
              No record for {selectedCustomer?.name || 'this customer'}
            </p>
          </div>
        ) : dispLogs.map(log => {
          const logId = log.id || log.text
          const displayedText = isLive ? (displayedTextMap[logId] ?? log.text) : log.text
          const isTyping = isLive && displayedText.length < (log.text || '').length
          const isAgent = log.sender === 'agent'

          return (
            <div key={logId} className={`flex flex-col ${isAgent ? 'items-start' : 'items-end'}`}>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: isAgent ? 'var(--live-accent)' : 'var(--text-muted)' }}>
                  {log.speaker || (isAgent ? 'AGENT' : 'CUSTOMER')}
                </span>
                <span style={{ color: 'var(--border-subtle)' }}>·</span>
                <span className="text-[9px] font-mono" style={{ color: 'var(--text-muted)' }}>{log.timestamp}</span>
              </div>
              <div
                className="px-3 py-2 rounded-xl text-xs leading-relaxed"
                style={{
                  maxWidth: 'min(88%, 320px)',
                  ...(isAgent
                    ? { background: 'var(--live-accent-bg)', border: '1px solid var(--live-accent-border)', borderLeft: `2px solid var(--live-accent)`, color: 'var(--text-primary)' }
                    : { background: 'var(--row-hover)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' })
                }}
              >
                {displayedText}
                {isTyping && <span className="inline-block w-1 h-3 ml-1 rounded-sm animate-pulse" style={{ background: 'var(--live-accent)' }} />}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
