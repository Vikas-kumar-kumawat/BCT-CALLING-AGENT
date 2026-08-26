import { useState } from 'react'
import PromotionCard from '../components/PromotionCard'
import ConversationStream from '../components/ConversationStream'
import { useConversation } from '../hooks/useConversation'
import { getApiUrl } from '../api'

export default function PlanPromotion() {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  const { logs, displayedTextMap, fetchLogs } = useConversation('/api/promotion/logs')

  const handleCall = async () => {
    setLoading(true)
    setStatus('')
    try {
      const res = await fetch(getApiUrl('/api/promotion'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Vikas',
          phone: '9057262630',
          promoPlan: '300 Mbps Ultra Fiber + 14 Free OTT Apps (₹999/mo)'
        })
      })
      const data = await res.json()
      setStatus(res.ok ? data.message || 'Promotion call initiated!' : `Call failed: ${data.message}`)
      if (res.ok) fetchLogs()
    } catch (err) {
      setStatus(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelCall = async () => {
    try {
      await fetch(getApiUrl('/api/promotion/cancel'), { method: 'POST' })
      setStatus('Call cancelled by agent.')
      fetchLogs()
    } catch (err) {
      setStatus('Call session ended.')
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="space-y-1 pb-5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <p style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--accent)' }}>Outbound Campaign</p>
        <h1 style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--text-primary)', fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 900, letterSpacing: '-0.03em' }}>Plan Promotion</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <PromotionCard 
          onCall={handleCall}
          onCancelCall={handleCancelCall}
          loading={loading}
          status={status}
        />
        <ConversationStream logs={logs} displayedTextMap={displayedTextMap} />
      </div>
    </div>
  )
}
