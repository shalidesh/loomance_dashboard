import React from 'react'
import { useLocation } from 'react-router-dom'
import { Sun, Moon } from 'lucide-react'
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
  { key: 'all', label: 'All Units' },
  { key: 'shop', label: 'Clothing Shop' },
  { key: 'garment', label: 'Garment' },
]

export default function Header() {
  const { pathname } = useLocation()
  const { businessUnit, setBusinessUnit, theme, toggleTheme } = useApp()
  const page = PAGE_TITLES[pathname] || { title: 'Loomance', sub: '' }

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-gold/10 bg-charcoal/50 backdrop-blur-md sticky top-0 z-30">
      {/* Page info */}
      <div>
        <h1 className="font-serif text-xl text-cream leading-none">{page.title}</h1>
        <p className="text-cream-muted text-xs mt-0.5 tracking-wide">{page.sub}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Business unit filter */}
        <div className="flex items-center bg-charcoal-light border border-gold/15 rounded-xl p-1 gap-0.5">
          {UNIT_BUTTONS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setBusinessUnit(key)}
              className={`
                px-3 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-all duration-200
                ${businessUnit === key
                  ? 'bg-gold/20 text-gold border border-gold/30 shadow-sm'
                  : 'text-cream-muted hover:text-cream hover:bg-cream/5'
                }
              `}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-gold/20
                     bg-charcoal-light text-cream-muted hover:text-gold hover:border-gold/40
                     transition-all duration-200"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  )
}
