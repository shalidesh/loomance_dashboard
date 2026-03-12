import React, { useEffect, useState, useMemo } from 'react'
import { FileText, Download, FileSpreadsheet, TrendingUp, TrendingDown, Wallet, BarChart2 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import Spinner from '../components/UI/Spinner'
import EmptyState from '../components/UI/EmptyState'
import { formatDate, formatCurrency, calcSummary, unitLabel, todayInputValue } from '../utils/formatters'
import { exportToCSV } from '../utils/exportCSV'
import { exportToPDF } from '../utils/exportPDF'
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns'

const QUICK_RANGES = [
  { label: 'This Month', fn: () => ({ start: startOfMonth(new Date()), end: endOfMonth(new Date()) }) },
  { label: 'Last Month', fn: () => ({ start: startOfMonth(subMonths(new Date(), 1)), end: endOfMonth(subMonths(new Date(), 1)) }) },
  { label: 'Last 3 Months', fn: () => ({ start: startOfMonth(subMonths(new Date(), 2)), end: endOfMonth(new Date()) }) },
  { label: 'Last 6 Months', fn: () => ({ start: startOfMonth(subMonths(new Date(), 5)), end: endOfMonth(new Date()) }) },
  { label: 'This Year', fn: () => ({ start: new Date(new Date().getFullYear(), 0, 1), end: new Date(new Date().getFullYear(), 11, 31) }) },
]

function toInputDate(d) {
  return format(d, 'yyyy-MM-dd')
}

export default function Reports() {
  const { transactions, loadingTx, fetchTransactions } = useApp()

  const [startDate, setStartDate] = useState(toInputDate(startOfMonth(new Date())))
  const [endDate, setEndDate] = useState(toInputDate(endOfMonth(new Date())))
  const [unitFilter, setUnitFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  function applyQuickRange({ start, end }) {
    setStartDate(toInputDate(start))
    setEndDate(toInputDate(end))
  }

  const filtered = useMemo(() => {
    const start = new Date(startDate + 'T00:00:00')
    const end = new Date(endDate + 'T23:59:59')
    return transactions.filter(t => {
      const d = t.date instanceof Date ? t.date : new Date(t.date)
      if (d < start || d > end) return false
      if (unitFilter !== 'all' && t.businessUnit !== unitFilter) return false
      if (typeFilter !== 'all' && t.type !== typeFilter) return false
      if (categoryFilter !== 'all' && t.category !== categoryFilter) return false
      return true
    })
  }, [transactions, startDate, endDate, unitFilter, typeFilter, categoryFilter])

  const summary = useMemo(() => calcSummary(filtered), [filtered])

  const categories = useMemo(() => {
    const cats = new Set(transactions.map(t => t.category).filter(Boolean))
    return ['all', ...Array.from(cats)]
  }, [transactions])

  // Category breakdown for the report
  const categoryBreakdown = useMemo(() => {
    const map = {}
    filtered.forEach(t => {
      const key = t.category || 'Uncategorized'
      if (!map[key]) map[key] = { income: 0, expense: 0 }
      if (t.type === 'income') map[key].income += Number(t.amount) || 0
      else map[key].expense += Number(t.amount) || 0
    })
    return Object.entries(map).map(([cat, v]) => ({ category: cat, ...v, net: v.income - v.expense }))
      .sort((a, b) => (b.income + b.expense) - (a.income + a.expense))
  }, [filtered])

  async function handlePDF() {
    setExporting(true)
    try {
      exportToPDF(filtered, summary, {
        dateRange: { start: new Date(startDate), end: new Date(endDate) },
        businessUnit: unitFilter,
        title: 'Financial Report',
      })
    } finally {
      setExporting(false)
    }
  }

  function handleCSV() {
    exportToCSV(filtered, 'loomance-report')
  }

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 animate-fade-in">
      <div>
        <h2 className="section-title">Financial Reports</h2>
        <p className="section-subtitle">Generate and export period-based financial summaries</p>
      </div>

      {/* Filters */}
      <div className="card p-5 space-y-4">
        {/* Quick range buttons */}
        <div>
          <p className="label mb-2">Quick Ranges</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_RANGES.map(({ label, fn }) => (
              <button key={label} onClick={() => applyQuickRange(fn())}
                className="btn-secondary !px-3 !py-1.5 !text-xs">
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Date range */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="label">From Date</label>
            <input type="date" className="input-field" value={startDate}
              onChange={e => setStartDate(e.target.value)} />
          </div>
          <div>
            <label className="label">To Date</label>
            <input type="date" className="input-field" value={endDate}
              onChange={e => setEndDate(e.target.value)} />
          </div>
          <div>
            <label className="label">Business Unit</label>
            <select className="input-field" value={unitFilter} onChange={e => setUnitFilter(e.target.value)}>
              <option value="all">All Units</option>
              <option value="shop">Clothing Shop</option>
              <option value="garment">Garment</option>
            </select>
          </div>
          <div>
            <label className="label">Type</label>
            <select className="input-field" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              <option value="all">All Types</option>
              <option value="income">Income Only</option>
              <option value="expense">Expenses Only</option>
            </select>
          </div>
        </div>

        {/* Export buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-gold/10">
          <p className="text-cream-muted text-xs">
            <span className="text-gold font-medium">{filtered.length}</span> transactions found
          </p>
          <div className="flex items-center gap-2">
            <button onClick={handleCSV} className="btn-secondary flex items-center gap-2 text-xs flex-1 sm:flex-none justify-center">
              <FileSpreadsheet size={14} /> Export CSV
            </button>
            <button onClick={handlePDF} disabled={exporting || filtered.length === 0}
              className="btn-primary flex items-center gap-2 text-xs disabled:opacity-50 flex-1 sm:flex-none justify-center">
              {exporting ? (
                <div className="w-3.5 h-3.5 border border-charcoal/30 border-t-charcoal rounded-full animate-spin" />
              ) : <FileText size={14} />}
              Download PDF
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {loadingTx ? <Spinner /> : filtered.length === 0 ? (
        <EmptyState icon={BarChart2} title="No data for selected period" description="Try adjusting your date range or filters." />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SummaryTile
              icon={TrendingUp}
              label="Total Revenue"
              value={formatCurrency(summary.totalIncome)}
              color="green"
              count={filtered.filter(t => t.type === 'income').length}
            />
            <SummaryTile
              icon={TrendingDown}
              label="Total Expenses"
              value={formatCurrency(summary.totalExpenses)}
              color="red"
              count={filtered.filter(t => t.type === 'expense').length}
            />
            <SummaryTile
              icon={Wallet}
              label="Net Profit"
              value={formatCurrency(summary.netProfit)}
              color={summary.netProfit >= 0 ? 'gold' : 'red'}
              sub={summary.netProfit >= 0 ? 'Profitable' : 'Loss'}
            />
          </div>

          {/* Category Breakdown */}
          {categoryBreakdown.length > 0 && (
            <div className="card overflow-hidden">
              <div className="px-4 sm:px-5 py-4 border-b border-gold/10">
                <h3 className="font-serif text-lg text-cream">Category Breakdown</h3>
              </div>
              {/* Desktop table */}
              <table className="hidden sm:table w-full text-sm">
                <thead>
                  <tr className="border-b border-gold/10">
                    <Th>Category</Th><Th>Income</Th><Th>Expenses</Th><Th>Net</Th>
                  </tr>
                </thead>
                <tbody>
                  {categoryBreakdown.map((row, i) => (
                    <tr key={row.category} className={`border-b border-gold/5 hover:bg-white/[0.03] ${i % 2 === 0 ? 'bg-white/[0.01]' : ''}`}>
                      <Td><span className="text-cream">{row.category}</span></Td>
                      <Td><span className="text-green-400">{row.income > 0 ? formatCurrency(row.income) : '—'}</span></Td>
                      <Td><span className="text-red-400">{row.expense > 0 ? formatCurrency(row.expense) : '—'}</span></Td>
                      <Td>
                        <span className={row.net >= 0 ? 'text-gold' : 'text-red-400'}>
                          {formatCurrency(row.net)}
                        </span>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Mobile cards */}
              <div className="sm:hidden divide-y divide-gold/5">
                {categoryBreakdown.map((row) => (
                  <div key={row.category} className="px-4 py-3">
                    <p className="text-cream text-sm font-medium mb-2">{row.category}</p>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <p className="text-cream-dark text-[9px] uppercase tracking-wider">Income</p>
                        <p className="text-green-400 text-xs">{row.income > 0 ? formatCurrency(row.income) : '—'}</p>
                      </div>
                      <div>
                        <p className="text-cream-dark text-[9px] uppercase tracking-wider">Expenses</p>
                        <p className="text-red-400 text-xs">{row.expense > 0 ? formatCurrency(row.expense) : '—'}</p>
                      </div>
                      <div>
                        <p className="text-cream-dark text-[9px] uppercase tracking-wider">Net</p>
                        <p className={`text-xs ${row.net >= 0 ? 'text-gold' : 'text-red-400'}`}>{formatCurrency(row.net)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transaction list preview */}
          <div className="card overflow-hidden">
            <div className="px-4 sm:px-5 py-4 border-b border-gold/10 flex items-center justify-between">
              <h3 className="font-serif text-lg text-cream">Transactions</h3>
              <span className="text-cream-muted text-xs">{filtered.length} entries</span>
            </div>
            {/* Desktop table */}
            <table className="hidden sm:table w-full text-sm">
              <thead>
                <tr className="border-b border-gold/10">
                  <Th>Date</Th><Th>Unit</Th><Th>Category</Th><Th>Description</Th><Th>Type</Th><Th>Amount</Th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t, i) => (
                  <tr key={t.id} className={`border-b border-gold/5 hover:bg-white/[0.03] ${t.type === 'income' ? 'income-row' : 'expense-row'} ${i % 2 === 0 ? 'bg-white/[0.01]' : ''}`}>
                    <Td>{formatDate(t.date)}</Td>
                    <Td><span className="text-cream-muted text-[10px] uppercase tracking-wide">{t.businessUnit === 'shop' ? 'Shop' : 'Garment'}</span></Td>
                    <Td>{t.category || '—'}</Td>
                    <Td><span className="text-cream max-w-[160px] truncate block">{t.description || '—'}</span></Td>
                    <Td>
                      <span className={`text-[10px] uppercase tracking-wide font-medium ${t.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                        {t.type}
                      </span>
                    </Td>
                    <Td>
                      <span className={`font-medium ${t.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                      </span>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Mobile cards */}
            <div className="sm:hidden divide-y divide-gold/5">
              {filtered.map((t) => (
                <div key={t.id} className={`px-4 py-3 flex items-start justify-between gap-2 ${t.type === 'income' ? 'income-row' : 'expense-row'}`}>
                  <div className="flex-1 min-w-0">
                    <p className="text-cream text-sm truncate">{t.description || '—'}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-cream-dark text-[10px] uppercase tracking-wide">{t.businessUnit === 'shop' ? 'Shop' : 'Garment'}</span>
                      <span className="text-cream-muted text-[10px]">{t.category || '—'}</span>
                      <span className="text-cream-dark text-[10px]">{formatDate(t.date)}</span>
                    </div>
                  </div>
                  <span className={`font-semibold text-sm flex-shrink-0 ${t.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function SummaryTile({ icon: Icon, label, value, color, count, sub }) {
  const colorMap = {
    green: 'text-green-400 bg-green-400/10',
    red: 'text-red-400 bg-red-400/10',
    gold: 'text-gold bg-gold/10',
  }
  return (
    <div className="card p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg ${colorMap[color]}`}>
          <Icon size={16} className={colorMap[color].split(' ')[0]} />
        </div>
        <span className="text-cream-muted text-[10px] uppercase tracking-widest">{label}</span>
      </div>
      <p className={`font-serif text-2xl ${colorMap[color].split(' ')[0]}`}>{value}</p>
      <p className="text-cream-dark text-xs mt-1">
        {count !== undefined ? `${count} entries` : sub}
      </p>
    </div>
  )
}

function Th({ children }) {
  return <th className="text-left text-cream-dark text-[10px] uppercase tracking-widest px-4 py-3 font-medium">{children}</th>
}
function Td({ children }) {
  return <td className="px-4 py-3 text-cream-muted text-xs">{children}</td>
}
