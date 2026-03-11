import React from 'react'
import { formatDate, formatCurrency, unitLabel } from '../../utils/formatters'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

export default function RecentTransactions({ transactions }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-serif text-lg text-cream">Recent Transactions</h3>
          <p className="text-cream-muted text-xs mt-0.5">Latest 10 entries</p>
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="flex items-center justify-center h-[200px] text-cream-muted text-sm">
          No transactions recorded yet
        </div>
      ) : (
        <div className="space-y-0 -mx-1">
          {transactions.slice(0, 10).map((t, i) => (
            <div
              key={t.id}
              className={`
                flex items-center justify-between px-3 py-2.5 rounded-lg
                transition-colors hover:bg-white/[0.03] group
                ${i % 2 === 0 ? 'bg-white/[0.02]' : ''}
              `}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`
                  p-1.5 rounded-lg flex-shrink-0
                  ${t.type === 'income' ? 'bg-green-400/10' : 'bg-red-400/10'}
                `}>
                  {t.type === 'income'
                    ? <ArrowUpRight size={13} className="text-green-400" />
                    : <ArrowDownRight size={13} className="text-red-400" />
                  }
                </div>
                <div className="min-w-0">
                  <p className="text-cream text-xs font-medium truncate">
                    {t.description || t.category || '—'}
                  </p>
                  <p className="text-cream-dark text-[10px] mt-0.5">
                    {formatDate(t.date)} · {unitLabel(t.businessUnit)}
                  </p>
                </div>
              </div>
              <span className={`
                text-sm font-semibold flex-shrink-0 ml-4
                ${t.type === 'income' ? 'text-green-400' : 'text-red-400'}
              `}>
                {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
