import { useState, useEffect } from 'react'
import CustomerListCard from '../components/CustomerListCard'
import ConversationStream from '../components/ConversationStream'
import { useConversation } from '../hooks/useConversation'
import { getApiUrl } from '../api'

export default function FeedbackCalls() {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState({ id: null, name: 'Vikas', phone: '9057262630' })
  const [phone, setPhone] = useState('9057262630')
  const [activeCallId, setActiveCallId] = useState(null)
  const { logs, displayedTextMap, fetchLogs } = useConversation('/api/feedbackcalls/logs')

  useEffect(() => {
    if (logs && logs.length > 0) {
      const lastLog = logs[logs.length - 1]
      if (lastLog.speaker === 'System' && (
        lastLog.text.toLowerCase().includes('ended') ||
        lastLog.text.toLowerCase().includes('failed') ||
        lastLog.text.toLowerCase().includes('cancelled') ||
        lastLog.text.toLowerCase().includes('completed')
      )) {
        setActiveCallId(null)
        setStatus('Call ended')
      }
    }
  }, [logs])

  const handleSelectCustomer = (customer) => {
    if (!customer) return
    const custPhone = customer['mobile-number'] || customer.phone || ''
    setSelectedCustomer({ id: customer.id, name: customer.name, phone: custPhone, feedback: customer.feedback })
    setPhone(custPhone)
  }

  const handleCall = async (customer = null) => {
    setLoading(true)
    setStatus('')
    const targetName = customer ? customer.name : selectedCustomer.name
    const targetPhone = customer ? (customer['mobile-number'] || customer.phone) : phone
    if (customer) { setActiveCallId(customer.id); handleSelectCustomer(customer) }

    try {
      const res = await fetch(getApiUrl('/api/feedbackcalls'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: targetName, phone: targetPhone })
      })
      const data = await res.json()
      setStatus(res.ok ? data.message || 'Call initiated!' : `Call failed: ${data.message}`)
      if (res.ok) fetchLogs()
    } catch (err) {
      setStatus(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelCall = async () => {
    try {
      await fetch(getApiUrl('/api/feedbackcalls/cancel'), { method: 'POST' })
      setStatus('Call cancelled')
      fetchLogs()
    } catch {
      setStatus('Call session ended')
    } finally {
      setActiveCallId(null)
    }
  }

  const isLiveCall = loading || activeCallId !== null ||
    (status && (status.includes('initiated') || status.includes('connected') || status.includes('playing')))

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="space-y-1 pb-5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <p style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--accent)' }}>Outbound Campaign</p>
        <h1 style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--text-primary)', fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: 900, letterSpacing: '-0.03em' }}>Feedback Calls</h1>
      </div>

      {/* Layout grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <div className="lg:col-span-7">
          <CustomerListCard
            onCall={handleCall}
            onCancelCall={handleCancelCall}
            onSelectCustomer={handleSelectCustomer}
            selectedCustomerId={selectedCustomer.id}
            activeCallId={activeCallId}
            status={status}
          />
        </div>
        <div className="lg:col-span-5">
          <ConversationStream
            logs={logs}
            displayedTextMap={displayedTextMap}
            selectedCustomer={selectedCustomer}
            isLiveCall={isLiveCall}
            status={status}
          />
        </div>
      </div>
    </div>
  )
}
