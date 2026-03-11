import React from 'react'

const COLOR_MAP = {
  green: {
    bg: 'bg-green-400/10',
    icon: 'text-green-400',
    border: 'border-green-400/20',
    bar: 'from-green-400/50',
  },
  red: {
    bg: 'bg-red-400/10',
    icon: 'text-red-400',
    border: 'border-red-400/20',
    bar: 'from-red-400/50',
  },
  gold: {
    bg: 'bg-gold/10',
    icon: 'text-gold',
    border: 'border-gold/20',
    bar: 'from-gold/50',
  },
}

export default function SummaryCard({ title, value, subtitle, icon: Icon, color = 'gold', trend }) {
  const c = COLOR_MAP[color] || COLOR_MAP.gold

  return (
    <div className={`card p-5 animate-fade-in ${c.border}`}>
      <div className="flex items-start justify-between mb-4">
        <span className="text-cream-muted text-[10px] uppercase tracking-[0.2em] font-medium">
          {title}
        </span>
        <div className={`p-2 rounded-lg ${c.bg}`}>
          <Icon size={16} className={c.icon} />
        </div>
      </div>

      <div className="font-serif text-2xl text-cream leading-none mb-1">{value}</div>

      {subtitle && (
        <p className="text-cream-muted text-xs mt-1.5">{subtitle}</p>
      )}

      {trend !== undefined && (
        <div className="flex items-center gap-1 mt-2">
          <span className={`text-xs font-medium ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}% vs last month
          </span>
        </div>
      )}

      {/* Decorative bar */}
      <div className={`mt-4 h-px bg-gradient-to-r ${c.bar} to-transparent`} />
    </div>
  )
}
