import { useState, useEffect } from 'react'
import { Phone, UserCircle2, Search, PhoneCall } from 'lucide-react'
import { getApiUrl } from '../api'

export default function Home({ onNavigate }) {
  const [contacts, setContacts] = useState([])
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
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          gap: '16px',
          flexWrap: 'wrap',
        }}>
          <div>
            <h3 style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 700, fontSize: '15px',
              letterSpacing: '-0.01em', color: 'var(--text-primary)', margin: 0,
            }}>
              Customer Directory
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
              style={{ paddingLeft: '30px', paddingTop: '6px', paddingBottom: '6px', fontSize: '12px' }}
            />
          </div>
        </div>

        {/* Table header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '3fr 2fr 4fr 2fr',
          padding: '10px 20px',
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
        <div style={{ maxHeight: '520px', overflowY: 'auto' }} className="custom-scrollbar">
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
              const avatarColors = ['#0064E0', '#9360F7', '#2ABBA7', '#31A24C', '#FB724B', '#F7B928']
              const avatarColor = avatarColors[idx % avatarColors.length]
              return (
                <div
                  key={c.id || idx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '3fr 2fr 4fr 2fr',
                    padding: '12px 20px',
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
                      width: '28px', height: '28px', borderRadius: '50%',
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
                      style={{ padding: '4px 12px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
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
