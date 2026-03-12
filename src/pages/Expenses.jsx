import React, { useEffect, useState, useMemo } from 'react'
import { Plus, ShoppingBag, Scissors, Trash2, Edit2, Loader } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { addTransaction, updateTransaction, deleteTransaction } from '../firebase/services'
import Modal from '../components/UI/Modal'
import ConfirmDialog from '../components/UI/ConfirmDialog'
import EmptyState from '../components/UI/EmptyState'
import Spinner from '../components/UI/Spinner'
import { formatDate, formatCurrency, todayInputValue, formatDateInput } from '../utils/formatters'

const SHOP_CATEGORIES = ['Stock Purchase', 'Utilities', 'Rent', 'Transport', 'Miscellaneous']
const GARMENT_CATEGORIES = ['Raw Materials', 'Employee Wages', 'Machine Maintenance', 'Utilities', 'Miscellaneous']
const PAYMENT_METHODS = ['Cash', 'Bank Transfer', 'Cheque', 'Card', 'Other']

// ─── Shop Expense Form ────────────────────────────────────────────────────────
function ShopExpenseForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState({
    amount: '',
    ...initial,
    date: initial?.date ? formatDateInput(initial.date) : todayInputValue(),
    category: initial?.category || 'Stock Purchase',
    supplierName: initial?.metadata?.supplierName || '',
    paymentMethod: initial?.metadata?.paymentMethod || 'Cash',
    notes: initial?.metadata?.notes || '',
  })
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.amount || Number(form.amount) <= 0) return
    setSaving(true)
    try {
      await onSave({
        type: 'expense',
        businessUnit: 'shop',
        category: form.category,
        description: form.category + (form.supplierName ? ` — ${form.supplierName}` : ''),
        amount: Number(form.amount),
        date: form.date,
        metadata: {
          supplierName: form.supplierName,
          paymentMethod: form.paymentMethod,
          notes: form.notes,
        },
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Date *</label>
          <input type="date" className="input-field" value={form.date}
            onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
        </div>
        <div>
          <label className="label">Category *</label>
          <select className="input-field" value={form.category}
            onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
            {SHOP_CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Supplier Name</label>
          <input type="text" className="input-field" placeholder="Optional" value={form.supplierName}
            onChange={e => setForm(f => ({ ...f, supplierName: e.target.value }))} />
        </div>
        <div>
          <label className="label">Payment Method</label>
          <select className="input-field" value={form.paymentMethod}
            onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))}>
            {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="label">Amount (Rs.) *</label>
        <input type="number" min="0.01" step="0.01" className="input-field text-lg" placeholder="0.00"
          value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required />
      </div>

      <div>
        <label className="label">Notes</label>
        <textarea className="input-field resize-none" rows={2} placeholder="Additional details..."
          value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-ghost">Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
          {saving && <Loader size={14} className="animate-spin" />}
          {initial ? 'Update Expense' : 'Add Expense'}
        </button>
      </div>
    </form>
  )
}

// ─── Garment Expense Form ─────────────────────────────────────────────────────
function GarmentExpenseForm({ initial, employees, onSave, onCancel }) {
  const [form, setForm] = useState({
    amount: '',
    ...initial,
    date: initial?.date ? formatDateInput(initial.date) : todayInputValue(),
    category: initial?.category || 'Raw Materials',
    employeeName: initial?.metadata?.employeeName || '',
    paymentMethod: initial?.metadata?.paymentMethod || 'Cash',
    notes: initial?.metadata?.notes || '',
  })
  const [saving, setSaving] = useState(false)
  const isWage = form.category === 'Employee Wages'

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.amount || Number(form.amount) <= 0) return
    setSaving(true)
    try {
      await onSave({
        type: 'expense',
        businessUnit: 'garment',
        category: form.category,
        description: isWage
          ? `Wages — ${form.employeeName}`
          : form.category + (form.notes ? `: ${form.notes.slice(0, 40)}` : ''),
        amount: Number(form.amount),
        date: form.date,
        metadata: {
          employeeName: isWage ? form.employeeName : '',
          paymentMethod: form.paymentMethod,
          notes: form.notes,
        },
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Date *</label>
          <input type="date" className="input-field" value={form.date}
            onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
        </div>
        <div>
          <label className="label">Category *</label>
          <select className="input-field" value={form.category}
            onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
            {GARMENT_CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {isWage && (
        <div>
          <label className="label">Employee Name *</label>
          {employees.length > 0 ? (
            <select className="input-field" value={form.employeeName}
              onChange={e => setForm(f => ({ ...f, employeeName: e.target.value }))}>
              <option value="">— Select employee —</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.name}>{emp.name} ({emp.role})</option>
              ))}
            </select>
          ) : (
            <input type="text" className="input-field" placeholder="Employee name" value={form.employeeName}
              onChange={e => setForm(f => ({ ...f, employeeName: e.target.value }))} />
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Amount (Rs.) *</label>
          <input type="number" min="0.01" step="0.01" className="input-field text-lg" placeholder="0.00"
            value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required />
        </div>
        <div>
          <label className="label">Payment Method</label>
          <select className="input-field" value={form.paymentMethod}
            onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))}>
            {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="label">Notes</label>
        <textarea className="input-field resize-none" rows={2} placeholder="Additional details..."
          value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-ghost">Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
          {saving && <Loader size={14} className="animate-spin" />}
          {initial ? 'Update Expense' : 'Add Expense'}
        </button>
      </div>
    </form>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Expenses() {
  const [tab, setTab] = useState('shop')
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const { transactions, employees, loadingTx, fetchTransactions, fetchEmployees, setTransactions } = useApp()

  useEffect(() => {
    fetchTransactions()
    fetchEmployees()
  }, [fetchTransactions, fetchEmployees])

  const shopExpenses = useMemo(
    () => transactions.filter(t => t.type === 'expense' && t.businessUnit === 'shop'),
    [transactions]
  )
  const garmentExpenses = useMemo(
    () => transactions.filter(t => t.type === 'expense' && t.businessUnit === 'garment'),
    [transactions]
  )

  async function handleAdd(data) {
    const id = await addTransaction(data)
    setTransactions(prev => [{ id, ...data, date: new Date(data.date), createdAt: new Date() }, ...prev])
    setShowForm(false)
  }

  async function handleUpdate(data) {
    await updateTransaction(editItem.id, data)
    setTransactions(prev => prev.map(t => t.id === editItem.id ? { ...t, ...data, date: new Date(data.date) } : t))
    setEditItem(null)
  }

  async function handleDelete(id) {
    await deleteTransaction(id)
    setTransactions(prev => prev.filter(t => t.id !== id))
    setDeleteTarget(null)
  }

  const isShop = tab === 'shop'
  const expenses = isShop ? shopExpenses : garmentExpenses

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 animate-fade-in">
      {/* Tabs */}
      <div className="flex gap-1 border-b border-gold/10">
        <TabButton active={isShop} onClick={() => { setTab('shop'); setShowForm(false); setEditItem(null) }} icon={ShoppingBag}>
          Clothing Shop
        </TabButton>
        <TabButton active={!isShop} onClick={() => { setTab('garment'); setShowForm(false); setEditItem(null) }} icon={Scissors}>
          Garment Division
        </TabButton>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="section-title truncate">{isShop ? 'Shop Expenses' : 'Garment Expenses'}</h2>
          <p className="section-subtitle hidden sm:block">{isShop ? 'Stock purchases & operational costs' : 'Materials, wages & manufacturing costs'}</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditItem(null) }} className="btn-primary flex items-center gap-2 flex-shrink-0">
          <Plus size={16} /> Add Expense
        </button>
      </div>

      {/* Category totals */}
      {expenses.length > 0 && (
        <CategoryBreakdown expenses={expenses} categories={isShop ? SHOP_CATEGORIES : GARMENT_CATEGORIES} />
      )}

      {/* List */}
      {loadingTx ? <Spinner /> : expenses.length === 0 ? (
        <EmptyState title="No expenses recorded" description="Track your first expense by clicking Add Expense." />
      ) : (
        <div className="card overflow-hidden">
          {/* Desktop table */}
          <table className="hidden sm:table w-full text-sm">
            <thead>
              <tr className="border-b border-gold/10">
                <Th>Date</Th><Th>Category</Th><Th>Description</Th><Th>Payment</Th><Th>Amount</Th><Th />
              </tr>
            </thead>
            <tbody>
              {expenses.map((t, i) => (
                <tr key={t.id} className={`border-b border-gold/5 hover:bg-white/[0.03] transition-colors expense-row ${i % 2 === 0 ? 'bg-white/[0.01]' : ''}`}>
                  <Td>{formatDate(t.date)}</Td>
                  <Td><CategoryBadge category={t.category} /></Td>
                  <Td><span className="text-cream text-xs max-w-[200px] truncate block">{t.description}</span></Td>
                  <Td>{t.metadata?.paymentMethod || '—'}</Td>
                  <Td><span className="text-red-400 font-medium">{formatCurrency(t.amount)}</span></Td>
                  <Td>
                    <div className="flex items-center gap-2 justify-end">
                      <ActionBtn icon={Edit2} onClick={() => { setEditItem(t); setShowForm(false) }} />
                      <ActionBtn icon={Trash2} danger onClick={() => setDeleteTarget(t.id)} />
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Mobile cards */}
          <div className="sm:hidden divide-y divide-gold/5">
            {expenses.map((t) => (
              <div key={t.id} className="px-4 py-3 expense-row flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-cream text-sm font-medium truncate">{t.description}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <CategoryBadge category={t.category} />
                    <span className="text-cream-dark text-[10px]">{formatDate(t.date)}</span>
                  </div>
                  {t.metadata?.paymentMethod && (
                    <p className="text-cream-dark text-[10px] mt-0.5">{t.metadata.paymentMethod}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className="text-red-400 font-semibold text-sm">{formatCurrency(t.amount)}</span>
                  <ActionBtn icon={Edit2} onClick={() => { setEditItem(t); setShowForm(false) }} />
                  <ActionBtn icon={Trash2} danger onClick={() => setDeleteTarget(t.id)} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)}
        title={`New ${isShop ? 'Shop' : 'Garment'} Expense`} size="md">
        {isShop
          ? <ShopExpenseForm onSave={handleAdd} onCancel={() => setShowForm(false)} />
          : <GarmentExpenseForm employees={employees} onSave={handleAdd} onCancel={() => setShowForm(false)} />
        }
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editItem} onClose={() => setEditItem(null)}
        title="Edit Expense" size="md">
        {editItem && isShop && (
          <ShopExpenseForm initial={editItem} onSave={handleUpdate} onCancel={() => setEditItem(null)} />
        )}
        {editItem && !isShop && (
          <GarmentExpenseForm initial={editItem} employees={employees} onSave={handleUpdate} onCancel={() => setEditItem(null)} />
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => handleDelete(deleteTarget)}
        title="Delete Expense"
        message="This will permanently delete this expense entry. Continue?"
      />
    </div>
  )
}

// ─── Category Breakdown ───────────────────────────────────────────────────────
function CategoryBreakdown({ expenses, categories }) {
  const totals = categories.reduce((acc, cat) => {
    acc[cat] = expenses.filter(e => e.category === cat).reduce((s, e) => s + (Number(e.amount) || 0), 0)
    return acc
  }, {})
  const grand = Object.values(totals).reduce((s, v) => s + v, 0)

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {categories.map(cat => {
        const amount = totals[cat]
        const pct = grand > 0 ? (amount / grand * 100).toFixed(0) : 0
        return amount > 0 ? (
          <div key={cat} className="card p-3">
            <p className="text-cream-dark text-[9px] uppercase tracking-widest mb-1 truncate">{cat}</p>
            <p className="text-red-400 text-sm font-semibold">{formatCurrency(amount)}</p>
            <div className="mt-2 bg-white/5 rounded-full h-1">
              <div className="bg-red-400/60 h-1 rounded-full" style={{ width: `${pct}%` }} />
            </div>
          </div>
        ) : null
      })}
    </div>
  )
}

function CategoryBadge({ category }) {
  return (
    <span className="bg-charcoal/60 border border-gold/15 text-cream-muted px-2 py-0.5 rounded text-[10px] uppercase tracking-wide whitespace-nowrap">
      {category}
    </span>
  )
}

function TabButton({ active, onClick, icon: Icon, children }) {
  return (
    <button onClick={onClick}
      className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all ${active ? 'tab-active' : 'tab-inactive'}`}>
      <Icon size={15} />{children}
    </button>
  )
}
function Th({ children }) {
  return <th className="text-left text-cream-dark text-[10px] uppercase tracking-widest px-4 py-3 font-medium">{children}</th>
}
function Td({ children }) {
  return <td className="px-4 py-3 text-cream-muted text-xs">{children}</td>
}
function ActionBtn({ icon: Icon, onClick, danger }) {
  return (
    <button onClick={onClick}
      className={`p-1.5 rounded transition-colors ${danger ? 'hover:text-red-400 hover:bg-red-400/10 text-cream-dark' : 'hover:text-gold hover:bg-gold/10 text-cream-dark'}`}>
      <Icon size={13} />
    </button>
  )
}
