import { useState } from 'react'
import CustomerCard from '../components/CustomerCard'
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

      {/* Clean Header Bar */}
      <div className="pb-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <h1 style={{ fontFamily: "'Source Serif 4', serif", color: 'var(--text-primary)' }} className="text-3xl font-bold tracking-tight">
          Feedback Calls
        </h1>
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
        <div className="lg:col-span-5 space-y-4">
          <CustomerCard
            customerName={selectedCustomer.name}
            onCall={() => handleCall()}
            onCancelCall={handleCancelCall}
            loading={loading && !activeCallId}
            status={!activeCallId ? status : ''}
            phoneInput={phone}
            onPhoneChange={setPhone}
          />
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
