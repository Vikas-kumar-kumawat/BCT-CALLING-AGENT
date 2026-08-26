import { useState, useEffect } from 'react'
import Home from './pages/Home'
import FeedbackCalls from './pages/FeedbackCalls'
import RechargeReminder from './pages/RechargeReminder'
import PlanPromotion from './pages/PlanPromotion'
import SalesAgent from './pages/SalesAgent'
import InboundCalls from './pages/InboundCalls'
import {
  LayoutDashboard, PhoneCall, Briefcase, CreditCard,
  Sparkles, Headphones, ChevronLeft, ChevronRight, Moon, Sun, Menu, X
} from 'lucide-react'

const PAGE_LABELS = {
  home: 'Dashboard', feedback: 'Feedback Calls', sales: 'Sales Agent',
  recharge: 'Recharge Reminder', promotion: 'Plan Promotion', inbound: 'Customer Support',
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

  const outboundItems = [
    { id: 'feedback',  label: 'Feedback Calls',   icon: PhoneCall  },
    { id: 'sales',     label: 'Sales Agent',       icon: Briefcase  },
    { id: 'recharge',  label: 'Recharge Reminder', icon: CreditCard },
    { id: 'promotion', label: 'Plan Promotion',    icon: Sparkles   },
  ]
  const inboundItems = [{ id: 'inbound', label: 'Customer Support', icon: Headphones }]

  const SidebarInner = ({ collapsed = false, onClose = null }) => (
    <>
      {/* Brand */}
      <div className="flex items-center justify-between px-4 py-4 shrink-0" style={{ borderBottom: '1px solid var(--sidebar-border)', minHeight: '60px' }}>
        <div className={`flex items-center gap-3 min-w-0 ${collapsed ? 'mx-auto cursor-pointer' : ''}`}
          onClick={() => collapsed && setIsSidebarOpen(true)}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'var(--accent)', boxShadow: '0 4px 16px rgba(232,96,46,0.4)' }}>
            <span className="text-white font-black text-sm" style={{ fontFamily: 'Manrope, sans-serif' }}>B</span>
          </div>
          {!collapsed && (
            <span className="font-black tracking-tight truncate" style={{ color: 'var(--text-primary)', fontSize: '15px', letterSpacing: '-0.02em' }}>
              BCT Fibernet
            </span>
          )}
        </div>
        {onClose ? (
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-all"
            style={{ color: 'var(--text-muted)', background: 'transparent' }}>
            <X size={16} />
          </button>
        ) : !collapsed && (
          <button onClick={() => setIsSidebarOpen(false)}
            className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-all"
            style={{ border: '1px solid var(--border-subtle)', color: 'var(--text-muted)', background: 'transparent' }}
            title="Collapse">
            <ChevronLeft size={13} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-5 custom-scrollbar">
        <div>
          <NavItem label="Dashboard" icon={LayoutDashboard} active={tab === 'home'} collapsed={collapsed} onClick={() => navigate('home')} />
        </div>
        <div className="space-y-0.5">
          {!collapsed && <p className="px-3 pb-2" style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Outbound</p>}
          {outboundItems.map(item => (
            <NavItem key={item.id} {...item} active={tab === item.id} collapsed={collapsed} onClick={() => navigate(item.id)} />
          ))}
        </div>
        <div className="space-y-0.5">
          {!collapsed && <p className="px-3 pb-2" style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Inbound</p>}
          {inboundItems.map(item => (
            <NavItem key={item.id} {...item} active={tab === item.id} collapsed={collapsed} onClick={() => navigate(item.id)} />
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-2 space-y-1.5" style={{ borderTop: '1px solid var(--sidebar-border)' }}>
        <button onClick={toggleTheme}
          className={`w-full rounded-xl flex items-center gap-2.5 py-2.5 cursor-pointer transition-all ${collapsed ? 'justify-center px-0' : 'px-3'}`}
          style={{ border: '1px solid var(--border-subtle)', background: 'transparent', color: 'var(--text-secondary)' }}
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}>
          {theme === 'dark'
            ? <Sun size={14} className="shrink-0" style={{ color: '#f5a623' }} />
            : <Moon size={14} className="shrink-0" style={{ color: 'var(--text-secondary)' }} />
          }
          {!collapsed && <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </span>}
        </button>
        {collapsed && (
          <button onClick={() => setIsSidebarOpen(true)}
            className="w-full h-9 rounded-xl flex items-center justify-center cursor-pointer transition-all"
            style={{ border: '1px solid var(--border-subtle)', background: 'transparent', color: 'var(--text-muted)' }}>
            <ChevronRight size={14} />
          </button>
        )}
      </div>
    </>
  )

  return (
    <div className="flex h-screen overflow-hidden antialiased" style={{ background: 'var(--bg-app)', color: 'var(--text-primary)', fontFamily: 'Manrope, sans-serif' }}>

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col shrink-0 overflow-hidden transition-all duration-300 ease-in-out relative z-20"
        style={{ width: isSidebarOpen ? '240px' : '60px', background: 'var(--sidebar-bg)', borderRight: '1px solid var(--sidebar-border)' }}>
        <SidebarInner collapsed={!isSidebarOpen} />
      </aside>

      {/* MOBILE DRAWER */}
      {isMobileDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
            onClick={() => setIsMobileDrawerOpen(false)} />
          <div className="relative flex flex-col h-full z-50 overflow-hidden"
            style={{ width: '260px', background: 'var(--sidebar-bg)', borderRight: '1px solid var(--sidebar-border)' }}>
            <SidebarInner onClose={() => setIsMobileDrawerOpen(false)} />
          </div>
        </div>
      )}

      {/* MAIN */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* MOBILE TOP BAR */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 shrink-0 z-10"
          style={{ background: 'var(--sidebar-bg)', borderBottom: '1px solid var(--sidebar-border)' }}>
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileDrawerOpen(true)}
              className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer"
              style={{ border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
              <Menu size={17} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'var(--accent)' }}>
                <span className="text-white font-black text-xs">B</span>
              </div>
              <span className="font-black text-sm" style={{ color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>BCT Fibernet</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600 }}>{PAGE_LABELS[tab]}</span>
            <button onClick={toggleTheme} className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer"
              style={{ border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
              {theme === 'dark' ? <Sun size={15} style={{ color: '#f5a623' }} /> : <Moon size={15} />}
            </button>
          </div>
        </header>

        {/* PAGE CONTENT */}
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

function NavItem({ label, icon: Icon, active, collapsed, onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button onClick={onClick} title={collapsed ? label : ''}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      className={`w-full flex items-center gap-3 rounded-xl transition-all duration-150 cursor-pointer relative text-left
        ${collapsed ? 'justify-center px-0 py-3' : 'px-3 py-2.5'}`}
      style={{
        background: active ? 'var(--accent-dim)' : hovered ? 'rgba(255,255,255,0.03)' : 'transparent',
        border: active ? '1px solid var(--accent-border)' : '1px solid transparent',
        fontWeight: active ? 700 : 500,
        fontSize: '13px',
        color: active ? 'var(--accent)' : 'var(--text-secondary)',
      }}>
      <Icon size={15} className="shrink-0" style={{ color: active ? 'var(--accent)' : 'var(--text-muted)' }} />
      {!collapsed && <span className="whitespace-nowrap truncate">{label}</span>}
    </button>
  )
}