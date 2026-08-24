import { useState, useEffect } from 'react'
import SupportIVRCard from '../components/SupportIVRCard'
import SupportStatsBar from '../components/SupportStatsBar'
import ComplaintsListCard from '../components/ComplaintsListCard'
import { getApiUrl } from '../api'

export default function InboundCalls() {
  const [activeOption, setActiveOption] = useState(null)
  const [complaints, setComplaints] = useState([])
  const [stats, setStats] = useState({ totalCalls: 24, openComplaints: 2, inProgressComplaints: 1, resolvedComplaints: 1 })

  useEffect(() => {
    fetchComplaints()
  }, [])

  const fetchComplaints = async () => {
    try {
      const res = await fetch(getApiUrl('/api/support/complaints'))
      if (!res.ok) throw new Error('Failed to fetch complaints')
      const data = await res.json()
      if (data.complaints) setComplaints(data.complaints)
      if (data.stats) setStats(data.stats)
    } catch (err) {
      console.error(err)
    }
  }

  const handleSelectOption = async (optionKey) => {
    setActiveOption(optionKey)
    try {
      const res = await fetch(getApiUrl('/api/support/option'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ option: optionKey, name: 'Vikas', phone: '9057262630' })
      })
      if (res.ok) {
        fetchComplaints()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleToggleStatus = async (id) => {
    try {
      const res = await fetch(getApiUrl(`/api/support/complaints/${id}/status`), { method: 'PUT' })
      if (res.ok) fetchComplaints()
    } catch (err) {
      console.error(err)
    }
  }

  const handleAddComplaint = async (newComplaint) => {
    try {
      const res = await fetch(getApiUrl('/api/support/complaints'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newComplaint)
      })
      if (res.ok) fetchComplaints()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-5 font-sans">
      {/* Clean Header Bar */}
      <div className="flex items-center justify-between border-b border-[#22242b] pb-3">
        <h1 className="text-xl font-extrabold text-white tracking-tight">CUSTOMER SUPPORT</h1>

        {/* Micro IVR Keys Pill Strip */}
        <SupportIVRCard 
          activeOption={activeOption}
          onSelectOption={handleSelectOption}
        />
      </div>

      {/* Top Metrics Cards Bar */}
      <SupportStatsBar stats={stats} />

      {/* Main Expanded Complaints Center Section */}
      <ComplaintsListCard 
        complaints={complaints}
        onToggleStatus={handleToggleStatus}
        onAddComplaint={handleAddComplaint}
      />
    </div>
  )
}
