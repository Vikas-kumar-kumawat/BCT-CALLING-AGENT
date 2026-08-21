import { useState } from 'react'
import Home from './Home'
import FeedbackCalls from './FeedbackCalls'
import RechargeReminder from './RechargeReminder'
import PlanPromotion from './PlanPromotion'
import SalesAgent from './SalesAgent'
import InboundCalls from './InboundCalls'

export default function App() {
  const [tab, setTab] = useState('home')

  const outboundItems = [
    { id: 'feedback', label: 'Feedback Calls', icon: '📞' },
    { id: 'sales', label: 'Sales Agent', icon: '💼' },
    { id: 'recharge', label: 'Recharge Reminder', icon: '💳' },
    { id: 'promotion', label: 'Plan Promotion', icon: '🚀' },
  ]

  const inboundItems = [
    { id: 'inbound', label: 'Customer Support IVR', icon: '📥' },
  ]

  return (
    <div className="flex h-screen bg-[#08090a] text-zinc-100 font-sans antialiased selection:bg-zinc-800 selection:text-white">
      {/* Dark Obsidian Sidebar */}
      <aside className="w-64 bg-[#111215] border-r border-[#22242b] p-4 flex flex-col justify-between select-none">
        <div className="space-y-6">
          {/* Logo / Brand Header */}
          <div className="flex items-center gap-3 px-2 py-1.5 border-b border-[#1c1e24] pb-4">
            <div className="h-8 w-8 bg-white text-black font-extrabold text-sm rounded-xl flex items-center justify-center shadow-md">
              BF
            </div>
            <div>
              <span className="font-bold text-white text-sm tracking-tight block">BFibernet</span>
              <span className="text-[10px] text-zinc-400 font-mono font-medium tracking-wider uppercase">Voice AI Console</span>
            </div>
          </div>

          {/* Navigation with Categories */}
          <nav className="space-y-4">
            {/* Dashboard Link */}
            <div>
              <button
                onClick={() => setTab('home')}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
                  tab === 'home'
                    ? 'bg-[#17181c] text-white border border-[#262832] shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#17181c]/50'
                }`}
              >
                <span>📊</span>
                <span>Dashboard</span>
              </button>
            </div>

            {/* Category: OUTBOUND CALLS */}
            <div className="space-y-1">
              <div className="px-2 text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
                <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full"></span> OUTBOUND CALLS
              </div>
              {outboundItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={`w-full px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2.5 cursor-pointer ${
                    tab === item.id
                      ? 'bg-[#17181c] text-emerald-400 border border-emerald-900/60 font-bold shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#17181c]/50'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            {/* Category: INBOUND CALLS */}
            <div className="space-y-1">
              <div className="px-2 text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
                <span className="h-1.5 w-1.5 bg-cyan-400 rounded-full"></span> INBOUND CALLS
              </div>
              {inboundItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={`w-full px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2.5 cursor-pointer ${
                    tab === item.id
                      ? 'bg-[#17181c] text-cyan-400 border border-cyan-900/60 font-bold shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#17181c]/50'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </nav>
        </div>

        {/* Footer Gateway Badge */}
        <div className="px-3.5 py-2.5 bg-[#17181c] border border-[#262832] rounded-xl text-[11px] text-zinc-400 flex items-center justify-between">
          <span className="font-mono text-zinc-400 text-[10px]">GATEWAY</span>
          <span className="text-emerald-400 font-bold text-xs flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-ping"></span> ONLINE
          </span>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-[#08090a] p-8">
        {tab === 'home' && <Home onNavigate={setTab} />}
        {tab === 'feedback' && <FeedbackCalls />}
        {tab === 'sales' && <SalesAgent />}
        {tab === 'recharge' && <RechargeReminder />}
        {tab === 'promotion' && <PlanPromotion />}
        {tab === 'inbound' && <InboundCalls />}
      </main>
    </div>
  )
}
