import { useState, useEffect } from 'react'
import { PhoneCall, CreditCard, Sparkles, Headphones, ArrowUpRight, Phone, UserCircle2, Search } from 'lucide-react'
import { getApiUrl } from '../api'

const modules = [
  { id: 'feedback',  title: 'Feedback Calls',    icon: PhoneCall },
  { id: 'recharge',  title: 'Recharge Reminder', icon: CreditCard },
  { id: 'promotion', title: 'Plan Promotion',     icon: Sparkles },
  { id: 'inbound',   title: 'Customer Support',  icon: Headphones },
]

const DUMMY_CONTACTS = [
  { id: 1, name: 'Vikas Kumawat', 'mobile-number': '9057262630', feedback: 'Excellent fiber speed, no issues.' },
  { id: 2, name: 'Rahul Sharma', 'mobile-number': '9876543210', feedback: 'Happy with speed, connection drops occasionally.' },
  { id: 3, name: 'Priya Patel', 'mobile-number': '9123456789', feedback: 'Excellent service, no issues with broadband.' },
  { id: 4, name: 'Amit Kumar', 'mobile-number': '9988776655', feedback: 'Router installation was delayed last time.' },
  { id: 5, name: 'Neha Gupta', 'mobile-number': '9191919191', feedback: 'Needs upgrading to 500Mbps plan soon.' },
  { id: 6, name: 'Sanjay Verma', 'mobile-number': '9000000000', feedback: 'Customer service was very helpful over the weekend.' },
  { id: 7, name: 'Ananya Roy', 'mobile-number': '9823011223', feedback: 'Billing query regarding last month invoice.' },
  { id: 8, name: 'Rajesh Kumar', 'mobile-number': '9711223344', feedback: 'High latency during gaming in peak hours.' },
  { id: 9, name: 'Sneha Reddy', 'mobile-number': '9650012345', feedback: 'Requested static IP assignment.' },
  { id: 10, name: 'Rohan Verma', 'mobile-number': '9540098765', feedback: 'Inquired about annual plan discount options.' },
  { id: 11, name: 'Pooja Singh', 'mobile-number': '9810987654', feedback: 'Relocation request to new address.' },
  { id: 12, name: 'Vikram Malhotra', 'mobile-number': '9999888777', feedback: 'Wi-Fi range issue in bedroom area.' },
  { id: 13, name: 'Kavita Joshi', 'mobile-number': '9871122334', feedback: 'Payment debited twice, needs refund support.' },
  { id: 14, name: 'Deepak Gupta', 'mobile-number': '9760011223', feedback: 'Interested in IPTV add-on package.' },
  { id: 15, name: 'Swati Nair', 'mobile-number': '9654321098', feedback: 'Router restart resolves daily dropouts.' },
  { id: 16, name: 'Manish Choudhary', 'mobile-number': '9899001122', feedback: 'Requesting fiber cable re-routing outside home.' },
  { id: 17, name: 'Neha Saxena', 'mobile-number': '9718877665', feedback: 'Upgrade to Gigabit Ethernet setup required.' },
  { id: 18, name: 'Suresh Rao', 'mobile-number': '9611223344', feedback: 'Renewal reminder sent via SMS received.' },
  { id: 19, name: 'Meera Iyer', 'mobile-number': '9500112233', feedback: 'Customer support representative resolved ticket quickly.' },
  { id: 20, name: 'Sandeep Bhatia', 'mobile-number': '9888776655', feedback: 'Outstanding stability during remote working hours.' },
  { id: 21, name: 'Arjun Kapoor', 'mobile-number': '9789012345', feedback: 'Inquired about fiber speed test inconsistency.' },
  { id: 22, name: 'Riya Sen', 'mobile-number': '9678901234', feedback: 'Wants to pause subscription during vacations.' },
  { id: 23, name: 'Tarun Gill', 'mobile-number': '9567890123', feedback: 'ONT device blinking red LED indicator.' },
  { id: 24, name: 'Ishita Das', 'mobile-number': '9456789012', feedback: 'Requested dual-band Wi-Fi 6 router upgrade.' },
  { id: 25, name: 'Gaurav Sethi', 'mobile-number': '9345678901', feedback: 'Payment received acknowledgement pending.' },
  { id: 26, name: 'Divya Pillai', 'mobile-number': '9234567890', feedback: 'High satisfaction with customer executive call.' },
  { id: 27, name: 'Kunal Bansal', 'mobile-number': '9123450987', feedback: 'Required invoice copy for company tax filing.' },
  { id: 28, name: 'Simran Kaur', 'mobile-number': '9012345678', feedback: 'Speed test showing 200Mbps on 300Mbps plan.' },
  { id: 29, name: 'Varun Mehra', 'mobile-number': '9987654321', feedback: 'Port forwarding configuration query.' },
  { id: 30, name: 'Aarti Deshmukh', 'mobile-number': '9876501234', feedback: 'Excellent support during fiber cable cut incident.' }
]

export default function Home({ onNavigate }) {
  const [contacts, setContacts] = useState(DUMMY_CONTACTS)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch(getApiUrl('/api/customers'))
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setContacts(data)
        }
      })
      .catch(() => {})
  }, [])

  const filteredContacts = contacts.filter(c => 
    c.name?.toLowerCase().includes(search.toLowerCase()) || 
    (c['mobile-number'] || c.phone || '').includes(search)
  )

  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* Header */}
      <div className="pb-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <h1
          style={{
            fontFamily: 'Manrope, sans-serif',
            color: 'var(--text-primary)',
            fontSize: 'clamp(28px, 5vw, 36px)',
            fontWeight: 900,
            letterSpacing: '-0.03em'
          }}
        >
          Command Center
        </h1>
      </div>

      {/* Module Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {modules.map((mod) => {
          const Icon = mod.icon
          return (
            <button
              key={mod.id}
              onClick={() => onNavigate(mod.id)}
              className="cg-card-hover group text-left w-full cursor-pointer flex items-center justify-between p-6"
            >
              <div className="flex items-center gap-4">
                <div
                  className="rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110"
                  style={{
                    width: '44px',
                    height: '44px',
                    minWidth: '44px',
                    background: 'var(--accent-dim)',
                    border: '1px solid var(--accent-border)'
                  }}
                >
                  <Icon size={20} style={{ color: 'var(--accent)' }} />
                </div>

                <h2
                  className="font-bold transition-colors group-hover:text-[var(--accent)]"
                  style={{
                    color: 'var(--text-primary)',
                    fontSize: '17px',
                    fontWeight: 700,
                    letterSpacing: '-0.01em'
                  }}
                >
                  {mod.title}
                </h2>
              </div>

              <div
                className="rounded-lg flex items-center justify-center shrink-0 transition-all duration-300 group-hover:bg-[var(--accent)] group-hover:border-[var(--accent)]"
                style={{
                  width: '32px',
                  height: '32px',
                  minWidth: '32px',
                  border: '1px solid var(--border-subtle)',
                  background: 'transparent'
                }}
              >
                <ArrowUpRight
                  size={15}
                  style={{ color: 'var(--text-muted)' }}
                  className="group-hover:text-white transition-colors"
                />
              </div>
            </button>
          )
        })}
      </div>

      {/* Contacts List Below Cards */}
      <div className="cg-card flex flex-col overflow-hidden space-y-0 mt-6">
        
        {/* Contacts Header & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <div>
            <p className="forbes-label-red mb-0.5">CUSTOMER DIRECTORY</p>
            <h3 style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--text-primary)', fontWeight: 800, fontSize: '18px' }}>
              Contacts List <span className="font-mono text-xs text-muted ml-2 font-normal">({filteredContacts.length})</span>
            </h3>
          </div>
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search contacts..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="cg-input w-full pl-9 pr-3 py-1.5 text-xs font-mono"
            />
          </div>
        </div>

        {/* Contacts Table Header */}
        <div className="grid grid-cols-12 px-5 py-2.5 text-[10px] font-bold uppercase tracking-wider" style={{ background: 'var(--row-hover)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
          <div className="col-span-5 sm:col-span-4">Contact</div>
          <div className="col-span-4 sm:col-span-3 font-mono">Phone</div>
          <div className="hidden sm:block sm:col-span-3">Latest Note</div>
          <div className="col-span-3 sm:col-span-2 text-right">Action</div>
        </div>

        {/* Contacts List Rows */}
        <div className="divide-y divide-[var(--border-subtle)] max-h-[500px] overflow-y-auto custom-scrollbar">
          {filteredContacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-xs" style={{ color: 'var(--text-muted)' }}>
              <UserCircle2 size={32} className="mb-2 opacity-40" />
              No contacts found
            </div>
          ) : (
            filteredContacts.map(c => {
              const phoneNum = c['mobile-number'] || c.phone || 'N/A'
              return (
                <div key={c.id} className="grid grid-cols-12 px-5 py-3.5 items-center hover:bg-[var(--row-hover)] transition-colors">
                  
                  {/* Name & Avatar */}
                  <div className="col-span-5 sm:col-span-4 flex items-center gap-3 min-w-0 pr-2">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-white uppercase"
                      style={{ background: 'var(--accent)', boxShadow: '0 2px 8px rgba(232,96,46,0.25)' }}
                    >
                      {c.name?.[0] || '?'}
                    </div>
                    <span className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                      {c.name}
                    </span>
                  </div>

                  {/* Phone */}
                  <div className="col-span-4 sm:col-span-3 font-mono text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                    {phoneNum}
                  </div>

                  {/* Feedback Note */}
                  <div className="hidden sm:block sm:col-span-3 text-xs truncate pr-4" style={{ color: 'var(--text-muted)' }}>
                    {c.feedback || 'No feedback yet.'}
                  </div>

                  {/* Action Button */}
                  <div className="col-span-3 sm:col-span-2 text-right">
                    <button
                      onClick={() => onNavigate('feedback')}
                      className="btn-primary inline-flex items-center gap-1 text-[11px] py-1 px-3 shrink-0"
                    >
                      <Phone size={11} /> Call
                    </button>
                  </div>

                </div>
              )
            })
          )}
        </div>

      </div>

    </div>
  )
}
