import React, { useEffect, useState, useMemo } from 'react'
import { Search, Edit2, Trash2, ArrowUpRight, ArrowDownRight, X, Filter } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { updateTransaction, deleteTransaction } from '../firebase/services'
import Modal from '../components/UI/Modal'
import ConfirmDialog from '../components/UI/ConfirmDialog'
import EmptyState from '../components/UI/EmptyState'
import Spinner from '../components/UI/Spinner'
import { formatDate, formatCurrency, formatDateInput, todayInputValue, unitLabel } from '../utils/formatters'

const SHOP_CATEGORIES = ['Sales', 'Stock Purchase', 'Utilities', 'Rent', 'Transport', 'Miscellaneous']
const GARMENT_CATEGORIES = ['Sub-Order Income', 'Raw Materials', 'Employee Wages', 'Machine Maintenance', 'Utilities', 'Miscellaneous']

// ─── Edit Form ────────────────────────────────────────────────────────────────
function EditTransactionForm({ transaction, onSave, onCancel }) {
  const [form, setForm] = useState({
    ...transaction,
    date: formatDateInput(transaction.date),
    amount: String(transaction.amount || ''),
    description: transaction.description || '',
    category: transaction.category || '',
    notes: transaction.metadata?.notes || '',
  })
  const [saving, setSaving] = useState(false)

  const allCategories = form.businessUnit === 'shop' ? SHOP_CATEGORIES : GARMENT_CATEGORIES

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await onSave({
        ...form,
        amount: Number(form.amount),
        metadata: { ...form.metadata, notes: form.notes },
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Date</label>
          <input type="date" className="input-field" value={form.date}
            onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
        </div>
        <div>
          <label className="label">Amount (Rs.)</label>
          <input type="number" min="0.01" step="0.01" className="input-field" value={form.amount}
            onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Business Unit</label>
          <select className="input-field" value={form.businessUnit}
            onChange={e => setForm(f => ({ ...f, businessUnit: e.target.value }))}>
            <option value="shop">Clothing Shop</option>
            <option value="garment">Garment</option>
          </select>
        </div>
        <div>
          <label className="label">Category</label>
          <select className="input-field" value={form.category}
            onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
            {allCategories.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="label">Description</label>
        <input type="text" className="input-field" value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
      </div>

      <div>
        <label className="label">Notes</label>
        <textarea className="input-field resize-none" rows={2} value={form.notes}
          onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-ghost">Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function History() {
  const [search, setSearch] = useState('')
  const [unitFilter, setUnitFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [editItem, setEditItem] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(1)
  const PER_PAGE = 25

  const { transactions, loadingTx, fetchTransactions, setTransactions } = useApp()

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const filtered = useMemo(() => {
    return transactions.filter(t => {
      // Text search
      if (search) {
        const q = search.toLowerCase()
        const match =
          t.description?.toLowerCase().includes(q) ||
          t.category?.toLowerCase().includes(q) ||
          t.metadata?.clientName?.toLowerCase().includes(q) ||
          t.metadata?.supplierName?.toLowerCase().includes(q) ||
          t.metadata?.employeeName?.toLowerCase().includes(q)
        if (!match) return false
      }
      if (unitFilter !== 'all' && t.businessUnit !== unitFilter) return false
      if (typeFilter !== 'all' && t.type !== typeFilter) return false
      if (dateFrom) {
        const start = new Date(dateFrom + 'T00:00:00')
        const d = t.date instanceof Date ? t.date : new Date(t.date)
        if (d < start) return false
      }
      if (dateTo) {
        const end = new Date(dateTo + 'T23:59:59')
        const d = t.date instanceof Date ? t.date : new Date(t.date)
        if (d > end) return false
      }
      return true
    })
  }, [transactions, search, unitFilter, typeFilter, dateFrom, dateTo])

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const hasActiveFilters = search || unitFilter !== 'all' || typeFilter !== 'all' || dateFrom || dateTo

  function clearFilters() {
    setSearch('')
    setUnitFilter('all')
    setTypeFilter('all')
    setDateFrom('')
    setDateTo('')
    setPage(1)
  }

  async function handleUpdate(data) {
    await updateTransaction(editItem.id, data)
    setTransactions(prev => prev.map(t => t.id === editItem.id
      ? { ...t, ...data, date: new Date(data.date), amount: Number(data.amount) }
      : t
    ))
    setEditItem(null)
  }

  async function handleDelete(id) {
    await deleteTransaction(id)
    setTransactions(prev => prev.filter(t => t.id !== id))
    setDeleteTarget(null)
  }

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="section-title">Transaction History</h2>
          <p className="section-subtitle">Full ledger — {transactions.length} total entries</p>
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs border transition-all ${showFilters || hasActiveFilters ? 'bg-gold/15 border-gold/30 text-gold' : 'border-gold/15 text-cream-muted hover:text-cream hover:border-gold/30'}`}>
          <Filter size={13} />
          Filters
          {hasActiveFilters && (
            <span className="bg-gold text-charcoal rounded-full w-4 h-4 flex items-center justify-center text-[9px] font-bold">!</span>
          )}
        </button>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cream-muted" />
        <input
          type="text"
          className="input-field pl-10 pr-10"
          placeholder="Search by description, category, client, supplier…"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
        />
        {search && (
          <button onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-cream-muted hover:text-cream">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Advanced filters */}
      {showFilters && (
        <div className="card p-4 animate-fade-in">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="label">Business Unit</label>
              <select className="input-field" value={unitFilter}
                onChange={e => { setUnitFilter(e.target.value); setPage(1) }}>
                <option value="all">All Units</option>
                <option value="shop">Clothing Shop</option>
                <option value="garment">Garment</option>
              </select>
            </div>
            <div>
              <label className="label">Type</label>
              <select className="input-field" value={typeFilter}
                onChange={e => { setTypeFilter(e.target.value); setPage(1) }}>
                <option value="all">All</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            <div>
              <label className="label">From Date</label>
              <input type="date" className="input-field" value={dateFrom}
                onChange={e => { setDateFrom(e.target.value); setPage(1) }} />
            </div>
            <div>
              <label className="label">To Date</label>
              <input type="date" className="input-field" value={dateTo}
                onChange={e => { setDateTo(e.target.value); setPage(1) }} />
            </div>
          </div>
          {hasActiveFilters && (
            <div className="flex justify-end mt-3">
              <button onClick={clearFilters} className="btn-ghost text-xs flex items-center gap-1">
                <X size={12} /> Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Results info */}
      {hasActiveFilters && (
        <p className="text-cream-muted text-xs">
          Showing <span className="text-gold">{filtered.length}</span> of {transactions.length} transactions
        </p>
      )}

      {/* Table */}
      {loadingTx ? <Spinner /> : filtered.length === 0 ? (
        <EmptyState title="No matching transactions" description="Try adjusting your search or filters." />
      ) : (
        <>
          <div className="card overflow-hidden">
            {/* Desktop table */}
            <table className="hidden sm:table w-full text-sm">
              <thead>
                <tr className="border-b border-gold/10 sticky top-0 bg-charcoal-light">
                  <Th>Date</Th>
                  <Th>Unit</Th>
                  <Th>Type</Th>
                  <Th>Category</Th>
                  <Th>Description</Th>
                  <Th className="text-right">Amount</Th>
                  <Th />
                </tr>
              </thead>
              <tbody>
                {paginated.map((t, i) => (
                  <tr
                    key={t.id}
                    className={`
                      border-b border-gold/5 hover:bg-white/[0.03] transition-colors
                      ${t.type === 'income' ? 'income-row' : 'expense-row'}
                      ${i % 2 === 0 ? 'bg-white/[0.01]' : ''}
                    `}
                  >
                    <Td>{formatDate(t.date)}</Td>
                    <Td>
                      <span className="text-[10px] uppercase tracking-wide text-cream-dark">
                        {t.businessUnit === 'shop' ? 'Shop' : 'Garment'}
                      </span>
                    </Td>
                    <Td>
                      <div className="flex items-center gap-1.5">
                        {t.type === 'income'
                          ? <ArrowUpRight size={12} className="text-green-400" />
                          : <ArrowDownRight size={12} className="text-red-400" />
                        }
                        <span className={`text-[10px] uppercase tracking-wide font-medium ${t.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                          {t.type}
                        </span>
                      </div>
                    </Td>
                    <Td>
                      <span className="bg-charcoal/60 border border-gold/10 text-cream-muted px-1.5 py-0.5 rounded text-[10px] whitespace-nowrap">
                        {t.category || '—'}
                      </span>
                    </Td>
                    <Td>
                      <span className="text-cream text-xs max-w-[200px] truncate block" title={t.description}>
                        {t.description || '—'}
                      </span>
                    </Td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-semibold text-sm ${t.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                      </span>
                    </td>
                    <Td>
                      <div className="flex items-center gap-1.5 justify-end">
                        <button onClick={() => setEditItem(t)}
                          className="p-1.5 rounded hover:text-gold hover:bg-gold/10 text-cream-dark transition-colors">
                          <Edit2 size={12} />
                        </button>
                        <button onClick={() => setDeleteTarget(t.id)}
                          className="p-1.5 rounded hover:text-red-400 hover:bg-red-400/10 text-cream-dark transition-colors">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Mobile cards */}
            <div className="sm:hidden divide-y divide-gold/5">
              {paginated.map((t) => (
                <div key={t.id} className={`px-4 py-3 flex items-start justify-between gap-2 ${t.type === 'income' ? 'income-row' : 'expense-row'}`}>
                  <div className="flex-1 min-w-0">
                    <p className="text-cream text-sm truncate">{t.description || '—'}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="bg-charcoal/60 border border-gold/10 text-cream-muted px-1.5 py-0.5 rounded text-[10px]">
                        {t.category || '—'}
                      </span>
                      <span className="text-cream-dark text-[10px] uppercase tracking-wide">
                        {t.businessUnit === 'shop' ? 'Shop' : 'Garment'}
                      </span>
                      <span className="text-cream-dark text-[10px]">{formatDate(t.date)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className={`font-semibold text-sm ${t.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                      {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                    </span>
                    <button onClick={() => setEditItem(t)}
                      className="p-1.5 rounded hover:text-gold hover:bg-gold/10 text-cream-dark transition-colors">
                      <Edit2 size={12} />
                    </button>
                    <button onClick={() => setDeleteTarget(t.id)}
                      className="p-1.5 rounded hover:text-red-400 hover:bg-red-400/10 text-cream-dark transition-colors">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-cream-muted text-xs">
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="btn-secondary !px-3 !py-1.5 !text-xs disabled:opacity-40">← Prev</button>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="btn-secondary !px-3 !py-1.5 !text-xs disabled:opacity-40">Next →</button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Edit Modal */}
      <Modal open={!!editItem} onClose={() => setEditItem(null)} title="Edit Transaction" size="md">
        {editItem && (
          <EditTransactionForm transaction={editItem} onSave={handleUpdate} onCancel={() => setEditItem(null)} />
        )}
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => handleDelete(deleteTarget)}
        title="Delete Transaction"
        message="This will permanently delete this transaction entry. This action cannot be undone."
      />
    </div>
  )
}

function Th({ children, className = '' }) {
  return (
    <th className={`text-cream-dark text-[10px] uppercase tracking-widest px-4 py-3 font-medium text-left ${className}`}>
      {children}
    </th>
  )
}
function Td({ children }) {
  return <td className="px-4 py-3 text-cream-muted text-xs">{children}</td>
}
