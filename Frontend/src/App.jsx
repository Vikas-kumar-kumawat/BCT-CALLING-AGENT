import { useState, useEffect } from 'react'
import Home from './pages/Home'
import FeedbackCalls from './pages/FeedbackCalls'
import RechargeReminder from './pages/RechargeReminder'
import PlanPromotion from './pages/PlanPromotion'
import SalesAgent from './pages/SalesAgent'
import InboundCalls from './pages/InboundCalls'
import Settings from './pages/Settings'
import {
  LayoutDashboard, PhoneCall, Briefcase, CreditCard,
  Sparkles, Headphones, Moon, Sun, Menu, X, Radio, ChevronRight
} from 'lucide-react'

const PAGE_LABELS = {
  home: 'Dashboard', feedback: 'Feedback Calls', sales: 'Sales Agent',
  recharge: 'Recharge Reminder', promotion: 'Plan Promotion', inbound: 'Customer Support',
  settings: 'Settings'
}

// ─── Meta AI Sidebar Nav Group ───────────────────────────────────────────────
function NavGroup({ label, children }) {
  return (
    <div style={{ marginBottom: '4px' }}>
      {label && (
        <div style={{
          padding: '16px 20px 6px',
          fontSize: '10px',
          fontWeight: 600,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          fontFamily: 'Inter, sans-serif',
        }}>
          {label}
        </div>
      )}
      {children}
    </div>
  )
}

// ─── Meta AI Nav Item — left-bar active indicator style ─────────────────────
function NavItem({ label, icon: Icon, active, onClick, collapsed }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      title={collapsed ? label : ''}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: collapsed ? '10px 0' : '9px 20px',
        justifyContent: collapsed ? 'center' : 'flex-start',
        background: active
          ? 'rgba(0, 100, 224, 0.10)'
          : hovered
          ? 'rgba(255, 255, 255, 0.04)'
          : 'transparent',
        border: 'none',
        borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        fontFamily: 'Inter, sans-serif',
        fontSize: '13px',
        fontWeight: active ? 600 : 400,
        letterSpacing: '-0.01em',
        color: active ? 'var(--accent-light)' : hovered ? 'var(--text-primary)' : 'var(--text-secondary)',
        textAlign: 'left',
        whiteSpace: 'nowrap',
      }}
    >
      <Icon
        size={16}
        style={{
          color: active ? 'var(--accent-light)' : 'var(--text-muted)',
          flexShrink: 0,
          transition: 'color 0.15s ease',
        }}
      />
      {!collapsed && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>}
    </button>
  )
}

export default function App() {
  const [tab, setTab] = useState('home')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false)
  const [theme, setTheme] = useState(() => localStorage.getItem('bct-theme') || 'dark')

  useEffect(() => {
    const root = window.document.documentElement
    if (theme === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
    localStorage.setItem('bct-theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')
  const navigate = (id) => { setTab(id); setIsMobileDrawerOpen(false) }

  const collapsed = !isSidebarOpen

  const SidebarContent = ({ showClose = false }) => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* ── Brand Header ───────────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed && !showClose ? 'center' : 'space-between',
        padding: '0 16px',
        height: '56px',
        borderBottom: '1px solid var(--sidebar-border)',
        flexShrink: 0,
      }}>
        {(!collapsed || showClose) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Meta-style logo mark — colored square */}
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '6px',
              background: 'linear-gradient(135deg, #0064E0 0%, #47A5FA 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <span style={{ color: '#fff', fontSize: '11px', fontWeight: 800, fontFamily: 'Inter, sans-serif' }}>B</span>
            </div>
            <div>
              <div style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '14px',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: 'var(--text-primary)',
                lineHeight: 1.2,
              }}>
                BCT <span style={{ color: 'var(--accent-light)' }}>Fibernet</span>
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'Inter, sans-serif', letterSpacing: '0.02em' }}>
                AI Platform
              </div>
            </div>
          </div>
        )}

        {/* Collapsed icon-only brand */}
        {collapsed && !showClose && (
          <div
            onClick={() => setIsSidebarOpen(true)}
            style={{
              width: '28px', height: '28px', borderRadius: '7px',
              background: 'linear-gradient(135deg, #0064E0 0%, #47A5FA 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}>
            <span style={{ color: '#fff', fontSize: '12px', fontWeight: 800, fontFamily: 'Inter, sans-serif' }}>B</span>
          </div>
        )}

        {showClose ? (
          <button onClick={() => setIsMobileDrawerOpen(false)} style={{
            background: 'transparent', border: 'none', color: 'var(--text-muted)',
            cursor: 'pointer', display: 'flex', padding: '4px',
          }}>
            <X size={16} />
          </button>
        ) : !collapsed ? (
          <button
            onClick={() => setIsSidebarOpen(false)}
            title="Collapse sidebar"
            style={{
              background: 'transparent',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-muted)',
              borderRadius: '6px',
              padding: '4px 6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <ChevronRight size={13} style={{ transform: 'rotate(180deg)' }} />
          </button>
        ) : null}
      </div>

      {/* ── Nav ─────────────────────────────────────────────────────── */}
      <nav style={{ flex: 1, overflowY: 'auto', paddingTop: '8px', paddingBottom: '8px' }} className="custom-scrollbar">

        <NavGroup label={!collapsed ? '' : null}>
          <NavItem label="Dashboard" icon={LayoutDashboard} active={tab === 'home'} collapsed={collapsed} onClick={() => navigate('home')} />
        </NavGroup>

        {/* Divider */}
        {!collapsed && (
          <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '4px 0' }} />
        )}

        <NavGroup label={!collapsed ? 'Outbound' : null}>
          <NavItem label="Feedback Calls" icon={PhoneCall} active={tab === 'feedback'} collapsed={collapsed} onClick={() => navigate('feedback')} />
          <NavItem label="Sales Agent" icon={Briefcase} active={tab === 'sales'} collapsed={collapsed} onClick={() => navigate('sales')} />
          <NavItem label="Recharge Reminder" icon={CreditCard} active={tab === 'recharge'} collapsed={collapsed} onClick={() => navigate('recharge')} />
          <NavItem label="Plan Promotion" icon={Sparkles} active={tab === 'promotion'} collapsed={collapsed} onClick={() => navigate('promotion')} />
        </NavGroup>

        {!collapsed && (
          <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '4px 0' }} />
        )}

        <NavGroup label={!collapsed ? 'Inbound' : null}>
          <NavItem label="Customer Support" icon={Headphones} active={tab === 'inbound'} collapsed={collapsed} onClick={() => navigate('inbound')} />
        </NavGroup>

        {!collapsed && (
          <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '4px 0' }} />
        )}

        <NavGroup label={!collapsed ? 'System' : null}>
          <NavItem label="Settings" icon={Radio} active={tab === 'settings'} collapsed={collapsed} onClick={() => navigate('settings')} />
        </NavGroup>
      </nav>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <div style={{
        borderTop: '1px solid var(--sidebar-border)',
        padding: collapsed ? '12px 0' : '12px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        flexShrink: 0,
      }}>
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            gap: '8px',
            padding: '8px',
            borderRadius: '6px',
            width: '100%',
            fontFamily: 'Inter, sans-serif',
            fontSize: '12px',
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          {theme === 'dark'
            ? <Sun size={14} style={{ color: '#F7B928', flexShrink: 0 }} />
            : <Moon size={14} style={{ flexShrink: 0 }} />
          }
          {!collapsed && <span style={{ color: 'var(--text-muted)' }}>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>}
        </button>

        {collapsed && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            style={{
              background: 'transparent', border: 'none', color: 'var(--text-muted)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '8px', borderRadius: '6px', width: '100%',
            }}
          >
            <ChevronRight size={14} />
          </button>
        )}
      </div>
    </div>
  )

  return (
    <div style={{
      display: 'flex', height: '100vh', overflow: 'hidden',
      background: 'var(--bg-app)', color: 'var(--text-primary)',
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>

      {/* ── DESKTOP SIDEBAR ──────────────────────────────────────────── */}
      <aside
        className="hidden md:flex"
        style={{
          width: collapsed ? '52px' : '232px',
          flexDirection: 'column',
          background: 'var(--sidebar-bg)',
          borderRight: '1px solid var(--sidebar-border)',
          transition: 'width 0.25s cubic-bezier(0.17,0.17,0,1)',
          overflow: 'hidden',
          flexShrink: 0,
          position: 'relative',
          zIndex: 20,
        }}
      >
        <SidebarContent />
      </aside>

      {/* ── MOBILE DRAWER ────────────────────────────────────────────── */}
      {isMobileDrawerOpen && (
        <div className="md:hidden" style={{ position: 'fixed', inset: 0, zIndex: 40, display: 'flex' }}>
          <div
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
            onClick={() => setIsMobileDrawerOpen(false)}
          />
          <div style={{
            position: 'relative', zIndex: 50, width: '260px',
            background: 'var(--sidebar-bg)',
            borderRight: '1px solid var(--sidebar-border)',
            display: 'flex', flexDirection: 'column', height: '100%',
          }}>
            <SidebarContent showClose />
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT ─────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Mobile top bar */}
        <header
          className="md:hidden"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 16px', height: '56px', flexShrink: 0,
            background: 'var(--sidebar-bg)',
            borderBottom: '1px solid var(--sidebar-border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setIsMobileDrawerOpen(true)}
              style={{
                background: 'transparent', border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)', borderRadius: '7px',
                padding: '7px', cursor: 'pointer', display: 'flex',
              }}
            >
              <Menu size={16} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '20px', height: '20px', borderRadius: '5px',
                background: 'linear-gradient(135deg, #0064E0 0%, #47A5FA 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ color: '#fff', fontSize: '10px', fontWeight: 800 }}>B</span>
              </div>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                BCT <span style={{ color: 'var(--accent-light)' }}>Fibernet</span>
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '11px', fontFamily: 'Inter, sans-serif' }}>
              {PAGE_LABELS[tab]}
            </span>
            <button
              onClick={toggleTheme}
              style={{
                background: 'transparent', border: '1px solid var(--border-subtle)',
                color: 'var(--text-secondary)', borderRadius: '7px',
                padding: '7px', cursor: 'pointer', display: 'flex',
              }}
            >
              {theme === 'dark' ? <Sun size={14} style={{ color: '#F7B928' }} /> : <Moon size={14} />}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflowY: 'auto', position: 'relative' }} className="custom-scrollbar">
          <div className="framer-ambient-glow" />
          <div style={{ padding: '32px', minHeight: '100%', position: 'relative', zIndex: 1 }}>
            {tab === 'home'      && <Home onNavigate={setTab} />}
            {tab === 'feedback'  && <FeedbackCalls />}
            {tab === 'sales'     && <SalesAgent />}
            {tab === 'recharge'  && <RechargeReminder />}
            {tab === 'promotion' && <PlanPromotion />}
            {tab === 'inbound'   && <InboundCalls />}
            {tab === 'settings'  && <Settings />}
          </div>
        </main>
      </div>
    </div>
  )
}