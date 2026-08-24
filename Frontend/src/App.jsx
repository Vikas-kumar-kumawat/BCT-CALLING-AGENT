import { useState } from 'react'
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
  ChevronRight
} from 'lucide-react'

export default function App() {
  const [tab, setTab] = useState('home')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const outboundItems = [
    { id: 'feedback', label: 'Feedback Calls', icon: PhoneCall },
    { id: 'sales', label: 'Sales Agent', icon: Briefcase },
    { id: 'recharge', label: 'Recharge Reminder', icon: CreditCard },
    { id: 'promotion', label: 'Plan Promotion', icon: Sparkles },
  ]

  const inboundItems = [
    { id: 'inbound', label: 'Customer Support IVR', icon: Headphones },
  ]

  return (
    // Base layout: True black, crisp text, subtle selection color
    <div className="flex h-screen bg-black text-zinc-300 font-sans antialiased selection:bg-[#76B900]/30 selection:text-[#76B900]">

      {/* Sidebar: Ultra-dark gray, subtle right border */}
      <aside className={`${isSidebarOpen ? 'w-72 p-5' : 'w-20 py-5 px-3'} bg-[#0a0a0a] border-r border-white/5 flex flex-col justify-between select-none relative z-10 transition-all duration-300 ease-in-out`}>

        {/* Subtle top ambient glow (Render style) */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />

        <div className="space-y-8 relative z-10">

          {/* Logo / Brand Header */}
          <div className={`flex items-center ${isSidebarOpen ? 'gap-3 px-1' : 'flex-col gap-5 justify-center'} pb-6 border-b border-white/5 transition-all duration-300`}>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-zinc-500 hover:text-zinc-200 transition-colors shrink-0 cursor-pointer"
            >
              {isSidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </button>
            <div className={`flex items-center ${isSidebarOpen ? 'gap-3' : 'justify-center'}`}>
              {/* Glowing Brand Icon */}
              <div className="h-8 w-8 bg-gradient-to-br from-[#76B900] to-emerald-600 text-black font-black text-xs rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(118,185,0,0.3)] ring-1 ring-white/10 shrink-0">
                BF
              </div>
              {isSidebarOpen && (
                <div className="overflow-hidden whitespace-nowrap">
                  <span className="font-semibold text-zinc-100 text-base tracking-tight block">
                    BFibernet
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-6">

            {/* Dashboard Link */}
            <div>
              <button
                onClick={() => setTab('home')}
                title={!isSidebarOpen ? 'Dashboard' : ''}
                className={`group w-full ${isSidebarOpen ? 'px-3 justify-start' : 'px-0 justify-center'} py-2.5 rounded-lg text-sm transition-all duration-200 flex items-center gap-3 cursor-pointer border ${tab === 'home'
                  ? 'bg-white/5 text-zinc-100 border-white/10 shadow-sm'
                  : 'bg-transparent text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-white/[0.02]'
                  }`}
              >
                <span className={`transition-transform duration-200 shrink-0 ${tab === 'home' ? 'scale-110 text-zinc-100' : 'group-hover:scale-110 text-zinc-400 group-hover:text-zinc-200'}`}>
                  <LayoutDashboard size={18} />
                </span>
                {isSidebarOpen && <span className={`whitespace-nowrap ${tab === 'home' ? 'font-medium' : 'font-normal'}`}>Dashboard</span>}
              </button>
            </div>

            {/* Category: OUTBOUND CALLS */}
            <div className="space-y-1.5">
              {isSidebarOpen ? (
                <div className="px-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2 mb-3 whitespace-nowrap overflow-hidden">
                  Outbound Calls
                </div>
              ) : (
                <div className="w-full border-t border-white/5 my-3"></div>
              )}
              {outboundItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => setTab(item.id)}
                    title={!isSidebarOpen ? item.label : ''}
                    className={`group w-full ${isSidebarOpen ? 'px-3 justify-start' : 'px-0 justify-center'} py-2.5 rounded-lg text-sm transition-all duration-200 flex items-center gap-3 cursor-pointer border ${tab === item.id
                      ? 'bg-gradient-to-r from-[#76B900]/10 to-transparent text-[#76B900] border-[#76B900]/20 font-medium'
                      : 'bg-transparent text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-white/[0.02]'
                      }`}
                  >
                    <span className={`transition-transform duration-200 shrink-0 ${tab === item.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                      <Icon size={18} />
                    </span>
                    {isSidebarOpen && <span className="whitespace-nowrap overflow-hidden">{item.label}</span>}
                  </button>
                )
              })}
            </div>

            {/* Category: INBOUND CALLS */}
            <div className="space-y-1.5">
              {isSidebarOpen ? (
                <div className="px-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2 mb-3 whitespace-nowrap overflow-hidden">
                  Inbound Calls
                </div>
              ) : (
                <div className="w-full border-t border-white/5 my-3"></div>
              )}
              {inboundItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => setTab(item.id)}
                    title={!isSidebarOpen ? item.label : ''}
                    className={`group w-full ${isSidebarOpen ? 'px-3 justify-start' : 'px-0 justify-center'} py-2.5 rounded-lg text-sm transition-all duration-200 flex items-center gap-3 cursor-pointer border ${tab === item.id
                      ? 'bg-gradient-to-r from-blue-500/10 to-transparent text-blue-400 border-blue-500/20 font-medium'
                      : 'bg-transparent text-zinc-400 border-transparent hover:text-zinc-200 hover:bg-white/[0.02]'
                      }`}
                  >
                    <span className={`transition-transform duration-200 shrink-0 ${tab === item.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                      <Icon size={18} />
                    </span>
                    {isSidebarOpen && <span className="whitespace-nowrap overflow-hidden">{item.label}</span>}
                  </button>
                )
              })}
            </div>
          </nav>
        </div>

        {/* Optional Footer/User Section can go here */}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-black relative">
        {/* Very subtle background noise or gradient can go here to break the solid black */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/[0.02] via-black to-black pointer-events-none" />

        <div className="relative z-10 p-10 h-full">
          {tab === 'home' && <Home onNavigate={setTab} />}
          {tab === 'feedback' && <FeedbackCalls />}
          {tab === 'sales' && <SalesAgent />}
          {tab === 'recharge' && <RechargeReminder />}
          {tab === 'promotion' && <PlanPromotion />}
          {tab === 'inbound' && <InboundCalls />}
        </div>
      </main>

    </div>
  )
}