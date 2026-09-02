import { useState, useEffect } from 'react'
import { Phone, UserCircle2, Search, PhoneCall, Briefcase, ArrowRight } from 'lucide-react'
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
    <div className="meta-fade-in" style={{ maxWidth: '1080px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <section className="cg-card" style={{ padding: '16px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <p className="meta-label" style={{ margin: 0, color: 'var(--text-muted)' }}>Dashboard</p>
            <h3 style={{
              margin: '6px 0 0',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              fontSize: '17px',
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
            }}>
              Simple shortcuts and contacts.
            </h3>
          </div>
        </div>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '14px' }}>
        <button
          onClick={() => onNavigate('feedback')}
          className="cg-card"
          style={{
            padding: '24px',
            textAlign: 'left',
            cursor: 'pointer',
            background: 'var(--cg-card-bg)',
            border: '1px solid var(--cg-card-border)',
            minHeight: '150px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '18px', height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--row-hover)', color: 'var(--text-primary)' }}>
                <PhoneCall size={18} />
              </div>
              <div>
                <div className="meta-label" style={{ margin: 0 }}>Feedback Calls</div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>Open calls</div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <ArrowRight size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            </div>
          </div>
        </button>

        <button
          onClick={() => onNavigate('sales')}
          className="cg-card"
          style={{
            padding: '24px',
            textAlign: 'left',
            cursor: 'pointer',
            background: 'var(--cg-card-bg)',
            border: '1px solid var(--cg-card-border)',
            minHeight: '150px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '18px', height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--row-hover)', color: 'var(--text-primary)' }}>
                <Briefcase size={18} />
              </div>
              <div>
                <div className="meta-label" style={{ margin: 0 }}>Sales Agent</div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>Open sales</div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <ArrowRight size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            </div>
          </div>
        </button>
      </section>

      {/* ── Customer Directory Card ───────────────────────────────── */}
      <div className="cg-card" style={{ overflow: 'hidden', minHeight: '50vh' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderBottom: '1px solid var(--border-subtle)',
          gap: '16px',
          flexWrap: 'wrap',
        }}>
          <div>
            <h3 style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              fontSize: '13px',
              letterSpacing: '-0.01em',
              color: 'var(--text-primary)',
              margin: 0,
            }}>
              Customer Directory
              <span style={{
                fontFamily: 'ui-monospace, monospace',
                fontSize: '12px',
                fontWeight: 400,
                color: 'var(--text-muted)',
                marginLeft: '8px',
              }}>
                ({filteredContacts.length})
              </span>
            </h3>
          </div>

          <div style={{ position: 'relative', width: '220px', minWidth: '180px' }}>
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

        <div style={{
          display: 'grid',
          gridTemplateColumns: '3fr 2fr 2fr',
          padding: '10px 16px',
          fontSize: '10px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--text-muted)',
          fontFamily: 'Inter, sans-serif',
          background: 'var(--row-hover)',
          borderBottom: '1px solid var(--border-subtle)',
        }}>
          <div>Contact</div>
          <div>Phone</div>
          <div style={{ textAlign: 'right' }}>Action</div>
        </div>

        <div style={{ maxHeight: 'calc(50vh - 98px)', overflowY: 'auto' }} className="custom-scrollbar">
          {filteredContacts.length === 0 ? (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', padding: '48px 0',
              color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif', fontSize: '13px',
            }}>
              <UserCircle2 size={28} style={{ opacity: 0.35, marginBottom: '8px' }} />
              No contacts found
            </div>
          ) : (
            filteredContacts.map((c, idx) => {
              const phoneNum = c['mobile-number'] || c.phone || 'N/A'
              const initial = c.name?.[0]?.toUpperCase() || '?'
              const avatarColors = ['#64748b', '#52525b', '#6b7280', '#475569', '#71717a', '#334155']
              const avatarColor = avatarColors[idx % avatarColors.length]
              return (
                <div
                  key={c.id || idx}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '3fr 2fr 2fr',
                    padding: '12px 16px',
                    alignItems: 'center',
                    borderBottom: '1px solid var(--border-subtle)',
                    transition: 'background 0.12s ease',
                    cursor: 'default',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--row-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
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

                  <div style={{
                    fontFamily: 'ui-monospace, monospace', fontSize: '12px',
                    color: 'var(--text-secondary)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {phoneNum}
                  </div>

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
