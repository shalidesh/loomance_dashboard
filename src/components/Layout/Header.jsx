import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Sun, Moon, Menu, LogOut } from 'lucide-react'
import { useApp } from '../../context/AppContext'

const PAGE_TITLES = {
  '/dashboard': { title: 'Dashboard', sub: 'Business performance at a glance' },
  '/income': { title: 'Income', sub: 'Record and manage income entries' },
  '/expenses': { title: 'Expenses', sub: 'Track all business expenditures' },
  '/employees': { title: 'Employees', sub: 'Garment division workforce' },
  '/reports': { title: 'Reports', sub: 'Financial summaries and exports' },
  '/history': { title: 'Transaction History', sub: 'Full ledger of all transactions' },
}

const UNIT_BUTTONS = [
  { key: 'all', label: 'All Units', short: 'All' },
  { key: 'shop', label: 'Clothing Shop', short: 'Shop' },
  { key: 'garment', label: 'Garment', short: 'Garment' },
]

export default function Header() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { businessUnit, setBusinessUnit, theme, toggleTheme, setMobileSidebarOpen, logout } = useApp()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }
  const page = PAGE_TITLES[pathname] || { title: 'Loomance', sub: '' }

  return (
    <header className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 border-b border-gold/10 bg-charcoal/50 backdrop-blur-md sticky top-0 z-30 gap-2">
      {/* Left: hamburger (mobile) + page info */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="md:hidden p-2 rounded-lg text-cream-muted hover:text-cream hover:bg-cream/5 transition-colors flex-shrink-0"
        >
          <Menu size={20} />
        </button>
        <div className="min-w-0">
          <h1 className="font-serif text-base sm:text-xl text-cream leading-none truncate">{page.title}</h1>
          <p className="text-cream-muted text-[10px] sm:text-xs mt-0.5 tracking-wide hidden sm:block">{page.sub}</p>
        </div>
      </div>

      {/* Right: unit filter + theme toggle */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Business unit filter */}
        <div className="flex items-center bg-charcoal-light border border-gold/15 rounded-xl p-1 gap-0.5">
          {UNIT_BUTTONS.map(({ key, label, short }) => (
            <button
              key={key}
              onClick={() => setBusinessUnit(key)}
              className={`
                px-2 sm:px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-medium tracking-wide transition-all duration-200
                ${businessUnit === key
                  ? 'bg-gold/20 text-gold border border-gold/30 shadow-sm'
                  : 'text-cream-muted hover:text-cream hover:bg-cream/5'
                }
              `}
            >
              <span className="sm:hidden">{short}</span>
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl border border-gold/20
                     bg-charcoal-light text-cream-muted hover:text-gold hover:border-gold/40
                     transition-all duration-200"
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          title="Sign out"
          className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl border border-gold/20
                     bg-charcoal-light text-cream-muted hover:text-red-400 hover:border-red-400/40
                     transition-all duration-200"
        >
          <LogOut size={15} />
        </button>
      </div>
    </header>
  )
}
