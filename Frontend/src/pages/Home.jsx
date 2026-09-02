import { useState, useEffect } from 'react'
import { PhoneCall, CreditCard, Sparkles, Headphones, ArrowUpRight, Phone, UserCircle2, Search, ArrowRight } from 'lucide-react'
import { getApiUrl } from '../api'

// ── Meta AI product card color themes ────────────────────────────────────────
const modules = [
  {
    id: 'feedback', title: 'Feedback Calls', subtitle: 'Automated AI-powered voice feedback collection from customers.',
    icon: PhoneCall, color: '#0064E0', colorBg: 'rgba(0,100,224,0.1)', tag: 'Outbound',
  },
  {
    id: 'recharge', title: 'Recharge Reminder', subtitle: 'Proactively remind customers before plan expiry with smart calls.',
    icon: CreditCard, color: '#31A24C', colorBg: 'rgba(49,162,76,0.1)', tag: 'Outbound',
  },
  {
    id: 'promotion', title: 'Plan Promotion', subtitle: 'AI sales agent promotes upgrade plans to eligible customers.',
    icon: Sparkles, color: '#9360F7', colorBg: 'rgba(147,96,247,0.1)', tag: 'Outbound',
  },
  {
    id: 'inbound', title: 'Customer Support', subtitle: 'Intelligent inbound IVR for issue resolution and complaint logging.',
    icon: Headphones, color: '#2ABBA7', colorBg: 'rgba(42,187,167,0.1)', tag: 'Inbound',
  },
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
]

// ── Meta-style product card ───────────────────────────────────────────────────
function ProductCard({ mod, onNavigate }) {
  const Icon = mod.icon
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={() => onNavigate(mod.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--cg-card-bg)',
        border: `1px solid ${hovered ? mod.color + '55' : 'var(--cg-card-border)'}`,
        borderRadius: '12px',
        padding: '24px',
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        boxShadow: hovered
          ? `0 12px 28px rgba(0,0,0,0.25), 0 0 0 1px ${mod.color}33`
          : '0 1px 2px rgba(0,0,0,0.2)',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        transition: 'all 0.2s cubic-bezier(0.14, 1, 0.34, 1)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top row: icon + tag */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        {/* Meta-style icon badge */}
        <div style={{
          width: '40px', height: '40px', borderRadius: '10px',
          background: mod.colorBg,
          border: `1px solid ${mod.color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          transition: 'transform 0.2s ease',
          transform: hovered ? 'scale(1.08)' : 'scale(1)',
        }}>
          <Icon size={18} style={{ color: mod.color }} />
        </div>

        {/* Tag chip */}
        <span style={{
          fontSize: '10px', fontWeight: 600, fontFamily: 'Inter, sans-serif',
          letterSpacing: '0.06em', textTransform: 'uppercase',
          color: mod.color,
          background: mod.colorBg,
          border: `1px solid ${mod.color}30`,
          borderRadius: '6px',
          padding: '3px 8px',
        }}>
          {mod.tag}
        </span>
      </div>

      {/* Title */}
      <div>
        <h2 style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '16px',
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: 'var(--text-primary)',
          marginBottom: '6px',
          lineHeight: 1.3,
        }}>
          {mod.title}
        </h2>
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '13px',
          color: 'var(--text-secondary)',
          lineHeight: 1.55,
          margin: 0,
        }}>
          {mod.subtitle}
        </p>
      </div>

      {/* Footer CTA — Meta "Get started →" style */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '4px',
        marginTop: 'auto',
        color: hovered ? mod.color : 'var(--text-muted)',
        transition: 'color 0.15s ease',
        fontFamily: 'Inter, sans-serif',
        fontSize: '12px',
        fontWeight: 500,
      }}>
        <span>Get started</span>
        <ArrowRight size={13} style={{
          transform: hovered ? 'translateX(3px)' : 'translateX(0)',
          transition: 'transform 0.15s ease',
        }} />
      </div>
    </button>
  )
}

export default function Home({ onNavigate }) {
  const [contacts, setContacts] = useState(DUMMY_CONTACTS)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch(getApiUrl('/api/customers'))
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setContacts(data)
      })
      .catch(() => {})
  }, [])

  const filteredContacts = contacts.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    (c['mobile-number'] || c.phone || '').includes(search)
  )

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>

      {/* ── Page Header — Meta AI style breadcrumb + title ─────────── */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          marginBottom: '12px',
          fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif',
        }}>
          <span>BCT Fibernet</span>
          <span>/</span>
          <span style={{ color: 'var(--text-secondary)' }}>AI Platform</span>
        </div>
        <h1 style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 'clamp(26px, 4vw, 34px)',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          color: 'var(--text-primary)',
          lineHeight: 1.2,
          marginBottom: '8px',
        }}>
          Products &amp; Solutions
        </h1>
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '14px',
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
        }}>
          Build intelligent calling workflows with BCT AI. Access feedback collection, sales automation, and customer support tools.
        </p>
      </div>

      {/* ── Section label — Meta style ─────────────────────────────── */}
      <div style={{
        fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em',
        textTransform: 'uppercase', color: 'var(--text-muted)',
        fontFamily: 'Inter, sans-serif', marginBottom: '16px',
      }}>
        AI Modules
      </div>

      {/* ── Product Cards Grid ─────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: '16px',
        marginBottom: '40px',
      }}>
        {modules.map(mod => (
          <ProductCard key={mod.id} mod={mod} onNavigate={onNavigate} />
        ))}
      </div>

      {/* ── Customer Directory Card ───────────────────────────────── */}
      <div style={{
        background: 'var(--cg-card-bg)',
        border: '1px solid var(--cg-card-border)',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
      }}>

        {/* Card header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '18px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          gap: '16px',
          flexWrap: 'wrap',
        }}>
          <div>
            <div style={{
              fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: 'var(--accent-light)',
              fontFamily: 'Inter, sans-serif', marginBottom: '4px',
            }}>
              Customer Directory
            </div>
            <h3 style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 700, fontSize: '17px',
              letterSpacing: '-0.02em', color: 'var(--text-primary)', margin: 0,
            }}>
              Contacts List
              <span style={{
                fontFamily: 'ui-monospace, monospace',
                fontSize: '12px', fontWeight: 400,
                color: 'var(--text-muted)', marginLeft: '8px',
              }}>
                ({filteredContacts.length})
              </span>
            </h3>
          </div>

          {/* Search */}
          <div style={{ position: 'relative', width: '220px', minWidth: '160px' }}>
            <Search size={13} style={{
              position: 'absolute', left: '10px', top: '50%',
              transform: 'translateY(-50%)', color: 'var(--text-muted)',
              pointerEvents: 'none',
            }} />
            <input
              type="text"
              placeholder="Search contacts..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="cg-input"
              style={{ paddingLeft: '30px', paddingTop: '8px', paddingBottom: '8px', fontSize: '12px' }}
            />
          </div>
        </div>

        {/* Table header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '3fr 2fr 4fr 2fr',
          padding: '10px 24px',
          fontSize: '10px', fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.08em',
          color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif',
          background: 'var(--row-hover)',
          borderBottom: '1px solid var(--border-subtle)',
        }}>
          <div>Contact</div>
          <div>Phone</div>
          <div className="hidden sm:block">Latest Note</div>
          <div style={{ textAlign: 'right' }}>Action</div>
        </div>

        {/* Rows */}
        <div style={{ maxHeight: '480px', overflowY: 'auto' }} className="custom-scrollbar">
          {filteredContacts.length === 0 ? (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', padding: '40px 0',
              color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif', fontSize: '13px',
            }}>
              <UserCircle2 size={28} style={{ opacity: 0.4, marginBottom: '8px' }} />
              No contacts found
            </div>
          ) : (
            filteredContacts.map((c, idx) => {
              const phoneNum = c['mobile-number'] || c.phone || 'N/A'
              const initial = c.name?.[0]?.toUpperCase() || '?'
              // Rotating avatar colors like Meta's avatar system
              const avatarColors = ['#0064E0', '#9360F7', '#2ABBA7', '#31A24C', '#FB724B', '#F7B928']
              const avatarColor = avatarColors[idx % avatarColors.length]
              return (
                <div
                  key={c.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '3fr 2fr 4fr 2fr',
                    padding: '12px 24px',
                    alignItems: 'center',
                    borderBottom: '1px solid var(--border-subtle)',
                    transition: 'background 0.12s ease',
                    cursor: 'default',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--row-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Name + Avatar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, paddingRight: '12px' }}>
                    <div style={{
                      width: '30px', height: '30px', borderRadius: '50%',
                      background: avatarColor,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, fontSize: '11px', fontWeight: 700,
                      color: '#fff', fontFamily: 'Inter, sans-serif',
                    }}>
                      {initial}
                    </div>
                    <span style={{
                      fontFamily: 'Inter, sans-serif', fontSize: '13px',
                      fontWeight: 500, color: 'var(--text-primary)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {c.name}
                    </span>
                  </div>

                  {/* Phone */}
                  <div style={{
                    fontFamily: 'ui-monospace, monospace', fontSize: '12px',
                    color: 'var(--text-secondary)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {phoneNum}
                  </div>

                  {/* Note */}
                  <div style={{
                    fontFamily: 'Inter, sans-serif', fontSize: '12px',
                    color: 'var(--text-muted)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    paddingRight: '16px',
                  }} className="hidden sm:block">
                    {c.feedback || 'No feedback yet.'}
                  </div>

                  {/* Action */}
                  <div style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => onNavigate('feedback')}
                      className="btn-primary"
                      style={{ padding: '5px 14px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
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
