import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  Users,
  FileBarChart,
  Clock,
  ChevronLeft,
  ChevronRight,
  Scissors,
  ShoppingBag,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', section: null },
  { to: '/income', icon: TrendingUp, label: 'Income', section: 'TRANSACTIONS' },
  { to: '/expenses', icon: TrendingDown, label: 'Expenses', section: null },
  { to: '/employees', icon: Users, label: 'Employees', section: 'GARMENT' },
  { to: '/reports', icon: FileBarChart, label: 'Reports', section: 'ANALYTICS' },
  { to: '/history', icon: Clock, label: 'History', section: null },
]

export default function Sidebar() {
  const { sidebarOpen, setSidebarOpen } = useApp()

  return (
    <aside
      className={`
        relative flex flex-col h-screen bg-charcoal-light border-r border-gold/10
        transition-all duration-300 ease-in-out flex-shrink-0
        ${sidebarOpen ? 'w-60' : 'w-16'}
      `}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gold/10">
        <div className="w-8 h-8 flex-shrink-0 bg-gold rounded-lg flex items-center justify-center shadow-lg shadow-gold/20">
          <span className="font-serif font-bold text-charcoal text-sm">L</span>
        </div>
        {sidebarOpen && (
          <div className="overflow-hidden">
            <div className="font-serif font-bold text-cream text-sm leading-none tracking-wide whitespace-nowrap">
              LOOMANCE
            </div>
            <div className="text-gold/70 text-[9px] tracking-[0.2em] whitespace-nowrap mt-0.5">
              CLOTHING
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
        {renderNavItems(NAV_ITEMS, sidebarOpen)}
      </nav>

      {/* Business unit legend (visible when open) */}
      {sidebarOpen && (
        <div className="px-4 py-4 border-t border-gold/10 space-y-2">
          <div className="flex items-center gap-2 text-[10px] text-cream-muted tracking-widest uppercase">
            <ShoppingBag size={11} className="text-gold" />
            <span>Clothing Shop</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-cream-muted tracking-widest uppercase">
            <Scissors size={11} className="text-gold" />
            <span>Garment Division</span>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute -right-3 top-[72px] w-6 h-6 bg-charcoal-light border border-gold/20 rounded-full
                   flex items-center justify-center text-gold hover:bg-gold hover:text-charcoal
                   transition-all duration-200 shadow-lg z-10"
      >
        {sidebarOpen ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
      </button>
    </aside>
  )
}

function renderNavItems(items, open) {
  let lastSection = null

  return items.map((item, idx) => {
    const showSection = item.section && item.section !== lastSection
    if (item.section) lastSection = item.section

    return (
      <React.Fragment key={item.to}>
        {showSection && (
          <div className={`px-4 pt-4 pb-1.5 ${open ? '' : 'hidden'}`}>
            <span className="text-[9px] uppercase tracking-[0.25em] text-cream-dark font-medium">
              {item.section}
            </span>
          </div>
        )}
        <NavLink
          to={item.to}
          className={({ isActive }) => `
            flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg text-sm
            transition-all duration-200 group relative
            ${isActive
              ? 'bg-gold/15 text-gold border border-gold/20'
              : 'text-cream-muted hover:text-cream hover:bg-white/5'
            }
          `}
          title={!open ? item.label : undefined}
        >
          {({ isActive }) => (
            <>
              <item.icon
                size={18}
                className={`flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-gold' : ''}`}
              />
              {open && (
                <span className="whitespace-nowrap font-medium">{item.label}</span>
              )}
              {isActive && open && (
                <div className="absolute right-3 w-1 h-1 rounded-full bg-gold" />
              )}
            </>
          )}
        </NavLink>
      </React.Fragment>
    )
  })
}
