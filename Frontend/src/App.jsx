import { useState, useEffect } from 'react'
import Home from './pages/Home'
import FeedbackCalls from './pages/FeedbackCalls'
import RechargeReminder from './pages/RechargeReminder'
import PlanPromotion from './pages/PlanPromotion'
import SalesAgent from './pages/SalesAgent'
import InboundCalls from './pages/InboundCalls'
import {
  LayoutDashboard,
  PhoneCall,
  Briefcase,
  CreditCard,
  Sparkles,
  Headphones,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  Menu,
  X
} from 'lucide-react'

const PAGE_LABELS = {
  home: 'Dashboard',
  feedback: 'Feedback Calls',
  sales: 'Sales Agent',
  recharge: 'Recharge Reminder',
  promotion: 'Plan Promotion',
  inbound: 'Customer Support',
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

  const navigate = (id) => {
    setTab(id)
    setIsMobileDrawerOpen(false)
  }

  const outboundItems = [
    { id: 'feedback',  label: 'Feedback Calls',   icon: PhoneCall  },
    { id: 'sales',     label: 'Sales Agent',       icon: Briefcase  },
    { id: 'recharge',  label: 'Recharge Reminder', icon: CreditCard },
    { id: 'promotion', label: 'Plan Promotion',    icon: Sparkles   },
  ]
  const inboundItems = [
    { id: 'inbound', label: 'Customer Support', icon: Headphones },
  ]

  const sidebarContent = (collapsed = false, onClose = null) => (
    <>
      {/* Brand */}
      <div className="flex items-center justify-between px-4 py-4 shrink-0" style={{ borderBottom: '1px solid var(--border-subtle)', minHeight: '60px' }}>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 bg-[#e00000] rounded-lg flex items-center justify-center shrink-0" style={{ boxShadow: '0 1px 4px rgba(224,0,0,0.3)' }}>
            <span style={{ fontFamily: "'Source Serif 4', serif" }} className="text-white font-bold text-sm">B</span>
          </div>
          {!collapsed && (
            <span style={{ fontFamily: "'Source Serif 4', serif", color: 'var(--text-primary)', fontWeight: 700, fontSize: '14px', whiteSpace: 'nowrap' }}>
              BCT Fibernet
            </span>
          )}
        </div>
        {onClose ? (
          <button onClick={onClose} className="w-8 h-8 rounded-md flex items-center justify-center cursor-pointer" style={{ color: 'var(--text-muted)', background: 'transparent' }}>
            <X size={18} />
          </button>
        ) : !collapsed && (
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="w-7 h-7 rounded-md flex items-center justify-center cursor-pointer transition-all"
            style={{ border: '1px solid var(--border-subtle)', background: 'transparent', color: 'var(--text-muted)' }}
            title="Collapse"
          >
            <ChevronLeft size={14} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4 custom-scrollbar">
        <div>
          <NavItem label="Dashboard" icon={LayoutDashboard} active={tab === 'home'} collapsed={collapsed} onClick={() => navigate('home')} />
        </div>
        <div className="space-y-0.5">
          {!collapsed && <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Outbound</p>}
          {outboundItems.map(item => (
            <NavItem key={item.id} {...item} active={tab === item.id} collapsed={collapsed} onClick={() => navigate(item.id)} />
          ))}
        </div>
        <div className="space-y-0.5">
          {!collapsed && <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Inbound</p>}
          {inboundItems.map(item => (
            <NavItem key={item.id} {...item} active={tab === item.id} collapsed={collapsed} onClick={() => navigate(item.id)} />
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-2 space-y-1.5" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <button
          onClick={toggleTheme}
          className={`w-full rounded-md flex items-center gap-2.5 py-2.5 cursor-pointer transition-all text-left ${collapsed ? 'justify-center px-0' : 'px-3'}`}
          style={{ border: '1px solid var(--border-subtle)', background: 'transparent', color: 'var(--text-secondary)' }}
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        >
          {theme === 'dark'
            ? <Sun size={15} className="shrink-0" style={{ color: '#F79009' }} />
            : <Moon size={15} className="shrink-0" style={{ color: 'var(--text-secondary)' }} />
          }
          {!collapsed && (
            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
              {theme === 'dark' ? 'Light mode' : 'Dark mode'}
            </span>
          )}
        </button>
        {collapsed && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="w-full h-9 rounded-md flex items-center justify-center cursor-pointer transition-all"
            style={{ border: '1px solid var(--border-subtle)', background: 'transparent', color: 'var(--text-muted)' }}
          >
            <ChevronRight size={15} />
          </button>
        )}
      </div>
    </>
  )

  return (
    <div className="flex h-screen overflow-hidden antialiased" style={{ background: 'var(--bg-app)', color: 'var(--text-primary)', fontFamily: "'Inter', -apple-system, sans-serif" }}>

      {/* ── DESKTOP SIDEBAR ── hidden on mobile */}
      <aside
        className="hidden md:flex flex-col shrink-0 overflow-hidden transition-all duration-300 ease-in-out relative z-20"
        style={{
          width: isSidebarOpen ? '240px' : '60px',
          background: 'var(--sidebar-bg)',
          borderRight: '1px solid var(--sidebar-border)',
        }}
      >
        {sidebarContent(!isSidebarOpen)}
      </aside>

      {/* ── MOBILE DRAWER OVERLAY ── */}
      {isMobileDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)' }}
            onClick={() => setIsMobileDrawerOpen(false)}
          />
          {/* Drawer */}
          <div
            className="relative flex flex-col h-full z-50 overflow-hidden"
            style={{ width: '260px', background: 'var(--sidebar-bg)', borderRight: '1px solid var(--sidebar-border)' }}
          >
            {sidebarContent(false, () => setIsMobileDrawerOpen(false))}
          </div>
        </div>
      )}

      {/* ── MAIN ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* ── MOBILE TOP BAR ── */}
        <header
          className="md:hidden flex items-center justify-between px-4 py-3 shrink-0 z-10"
          style={{ background: 'var(--sidebar-bg)', borderBottom: '1px solid var(--border-subtle)' }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileDrawerOpen(true)}
              className="w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer"
              style={{ border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}
            >
              <Menu size={18} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[#e00000] rounded-md flex items-center justify-center">
                <span style={{ fontFamily: "'Source Serif 4', serif" }} className="text-white font-bold text-xs">B</span>
              </div>
              <span style={{ fontFamily: "'Source Serif 4', serif", color: 'var(--text-primary)', fontWeight: 700, fontSize: '14px' }}>
                BCT Fibernet
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 500 }}>{PAGE_LABELS[tab]}</span>
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer"
              style={{ border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}
            >
              {theme === 'dark' ? <Sun size={16} style={{ color: '#F79009' }} /> : <Moon size={16} />}
            </button>
          </div>
        </header>

        {/* ── PAGE CONTENT ── */}
        <main className="flex-1 overflow-y-auto relative bg-dot-grid">
          <div className="framer-ambient-glow" />
          <div className="p-4 sm:p-6 md:p-8 min-h-full relative z-10">
            {tab === 'home'      && <Home onNavigate={setTab} />}
            {tab === 'feedback'  && <FeedbackCalls />}
            {tab === 'sales'     && <SalesAgent />}
            {tab === 'recharge'  && <RechargeReminder />}
            {tab === 'promotion' && <PlanPromotion />}
            {tab === 'inbound'   && <InboundCalls />}
          </div>
        </main>
      </div>
    </div>
  )
}

/* ── Nav Item ── */
function NavItem({ label, icon: Icon, active, collapsed, onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onClick}
      title={collapsed ? label : ''}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`w-full flex items-center gap-2.5 rounded-md transition-all duration-150 cursor-pointer relative text-left ${collapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2'}`}
      style={{
        background: active ? 'rgba(224,0,0,0.08)' : hovered ? 'var(--row-hover)' : 'transparent',
        color: active ? '#e00000' : 'var(--text-secondary)',
        border: 'none',
        fontWeight: active ? 600 : 500,
        fontSize: '14px',
      }}
    >
      <Icon size={16} className="shrink-0" style={{ color: active ? '#e00000' : 'var(--text-muted)' }} />
      {!collapsed && <span className="whitespace-nowrap truncate">{label}</span>}
    </button>
  )
}