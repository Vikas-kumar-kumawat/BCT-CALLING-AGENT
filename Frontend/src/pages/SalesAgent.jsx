import { useState } from 'react'
import CustomerCard from '../components/CustomerCard'
import ConversationStream from '../components/ConversationStream'
import { useConversation } from '../hooks/useConversation'
import { getApiUrl } from '../api'

export default function SalesAgent() {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  const [phone, setPhone] = useState('9057262630')
  const { logs, displayedTextMap, fetchLogs } = useConversation('/api/salesagent/logs')

  const handleCall = async () => {
    setLoading(true)
    setStatus('')
    try {
      const res = await fetch(getApiUrl('/api/salesagent'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Prospect Customer', phone: phone })
      })
      const data = await res.json()
      setStatus(res.ok ? data.message || 'Sales outbound call initiated!' : `Call failed: ${data.message}`)
      if (res.ok) fetchLogs()
    } catch (err) {
      setStatus(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelCall = async () => {
    setStatus('Sales call ended by agent.')
    fetchLogs()
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <section className="cg-card px-5 py-4">
        <p className="meta-label" style={{ margin: 0, color: 'var(--text-muted)' }}>Sales Agent</p>
        <h1 style={{
          margin: '6px 0 0',
          fontFamily: 'Inter, sans-serif',
          fontSize: '22px',
          fontWeight: 700,
          letterSpacing: '-0.03em',
          color: 'var(--text-primary)',
          lineHeight: 1.2,
        }}>
          Quick outbound calling
        </h1>
      </section>

      <div className="space-y-4">
        <CustomerCard
          onCall={handleCall} 
          onCancelCall={handleCancelCall} 
          loading={loading} 
          status={status} 
          phoneInput={phone}
          onPhoneChange={setPhone}
        />
        <ConversationStream logs={logs} displayedTextMap={displayedTextMap} />
      </div>
    </div>
  )
}
