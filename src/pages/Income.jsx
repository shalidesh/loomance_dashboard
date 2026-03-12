import React, { useEffect, useState, useMemo } from 'react'
import { Plus, ShoppingBag, Scissors, Trash2, Edit2, CheckCircle, Clock, Loader } from 'lucide-react'
import { useApp } from '../context/AppContext'
import {
  addTransaction, updateTransaction, deleteTransaction,
  addOrder, updateOrder, deleteOrder,
} from '../firebase/services'
import Modal from '../components/UI/Modal'
import ConfirmDialog from '../components/UI/ConfirmDialog'
import EmptyState from '../components/UI/EmptyState'
import Spinner from '../components/UI/Spinner'
import { formatDate, formatCurrency, todayInputValue, formatDateInput } from '../utils/formatters'

const PAYMENT_METHODS = ['Cash', 'Card', 'Bank Transfer', 'Cheque', 'Other']
const ORDER_STATUSES = ['pending', 'in-progress', 'completed']

// ─── Shop Income Form ─────────────────────────────────────────────────────────
function ShopIncomeForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState({
    description: '',
    quantity: '',
    unitPrice: '',
    paymentMethod: 'Cash',
    notes: '',
    ...initial,
    date: initial?.date ? formatDateInput(initial.date) : todayInputValue(),
  })
  const [saving, setSaving] = useState(false)

  const total = (Number(form.quantity) || 0) * (Number(form.unitPrice) || 0)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.description || !form.quantity || !form.unitPrice) return
    setSaving(true)
    try {
      await onSave({
        type: 'income',
        businessUnit: 'shop',
        category: 'Sales',
        description: form.description,
        amount: total,
        date: form.date,
        metadata: {
          quantity: Number(form.quantity),
          unitPrice: Number(form.unitPrice),
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
          <label className="label">Payment Method</label>
          <select className="input-field" value={form.paymentMethod}
            onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))}>
            {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="label">Item / Description *</label>
        <input type="text" className="input-field" placeholder="e.g., Men's T-shirt (White, L)" value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Quantity Sold *</label>
          <input type="number" min="1" className="input-field" placeholder="0" value={form.quantity}
            onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} required />
        </div>
        <div>
          <label className="label">Unit Price (Rs.) *</label>
          <input type="number" min="0" step="0.01" className="input-field" placeholder="0.00" value={form.unitPrice}
            onChange={e => setForm(f => ({ ...f, unitPrice: e.target.value }))} required />
        </div>
      </div>

      {/* Total preview */}
      {total > 0 && (
        <div className="flex items-center justify-between bg-gold/5 border border-gold/20 rounded-lg px-4 py-3">
          <span className="text-cream-muted text-sm">Total Amount</span>
          <span className="font-serif text-lg text-gold">{formatCurrency(total)}</span>
        </div>
      )}

      <div>
        <label className="label">Notes</label>
        <textarea className="input-field resize-none" rows={2} placeholder="Optional notes..."
          value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-ghost">Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
          {saving && <Loader size={14} className="animate-spin" />}
          {initial ? 'Update Entry' : 'Add Income'}
        </button>
      </div>
    </form>
  )
}

// ─── Garment Income Form ──────────────────────────────────────────────────────
function GarmentIncomeForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState({
    clientName: '',
    description: '',
    orderValue: '',
    advancePaid: '',
    status: 'pending',
    notes: '',
    ...initial,
    date: initial?.date ? formatDateInput(initial.date) : todayInputValue(),
  })
  const [saving, setSaving] = useState(false)

  const balanceDue = (Number(form.orderValue) || 0) - (Number(form.advancePaid) || 0)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.clientName || !form.orderValue) return
    setSaving(true)
    try {
      await onSave({
        date: form.date,
        clientName: form.clientName,
        description: form.description,
        orderValue: Number(form.orderValue),
        advancePaid: Number(form.advancePaid) || 0,
        balanceDue: Math.max(0, balanceDue),
        status: form.status,
        notes: form.notes,
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
          <label className="label">Status</label>
          <select className="input-field" value={form.status}
            onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
            {ORDER_STATUSES.map(s => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1).replace('-', ' ')}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="label">Client Name *</label>
        <input type="text" className="input-field" placeholder="e.g., XYZ Fashion House" value={form.clientName}
          onChange={e => setForm(f => ({ ...f, clientName: e.target.value }))} required />
      </div>

      <div>
        <label className="label">Order Description</label>
        <textarea className="input-field resize-none" rows={2} placeholder="e.g., 50 pieces school uniforms..."
          value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Order Value (Rs.) *</label>
          <input type="number" min="0" step="0.01" className="input-field" placeholder="0.00" value={form.orderValue}
            onChange={e => setForm(f => ({ ...f, orderValue: e.target.value }))} required />
        </div>
        <div>
          <label className="label">Advance Paid (Rs.)</label>
          <input type="number" min="0" step="0.01" className="input-field" placeholder="0.00" value={form.advancePaid}
            onChange={e => setForm(f => ({ ...f, advancePaid: e.target.value }))} />
        </div>
      </div>

      {Number(form.orderValue) > 0 && (
        <div className="flex items-center justify-between bg-gold/5 border border-gold/20 rounded-lg px-4 py-3">
          <span className="text-cream-muted text-sm">Balance Due</span>
          <span className="font-serif text-lg text-gold">{formatCurrency(Math.max(0, balanceDue))}</span>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-ghost">Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
          {saving && <Loader size={14} className="animate-spin" />}
          {initial ? 'Update Order' : 'Add Order'}
        </button>
      </div>
    </form>
  )
}

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    pending: 'status-pending',
    'in-progress': 'status-progress',
    completed: 'status-completed',
  }
  const labels = { pending: 'Pending', 'in-progress': 'In Progress', completed: 'Completed' }
  return <span className={map[status] || 'status-pending'}>{labels[status] || status}</span>
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Income() {
  const [tab, setTab] = useState('shop')
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const { transactions, orders, loadingTx, loadingOrd, fetchTransactions, fetchOrders, setTransactions, setOrders } = useApp()

  useEffect(() => {
    fetchTransactions()
    fetchOrders()
  }, [fetchTransactions, fetchOrders])

  const shopIncome = useMemo(
    () => transactions.filter(t => t.type === 'income' && t.businessUnit === 'shop'),
    [transactions]
  )

  // ── Shop handlers ──────────────────────────────────────────────────────────
  async function handleAddShop(data) {
    const id = await addTransaction(data)
    setTransactions(prev => [{ id, ...data, date: new Date(data.date), createdAt: new Date() }, ...prev])
    setShowForm(false)
  }

  async function handleUpdateShop(data) {
    await updateTransaction(editItem.id, data)
    setTransactions(prev => prev.map(t => t.id === editItem.id ? { ...t, ...data, date: new Date(data.date) } : t))
    setEditItem(null)
  }

  async function handleDeleteShop(id) {
    await deleteTransaction(id)
    setTransactions(prev => prev.filter(t => t.id !== id))
  }

  // ── Garment/order handlers ────────────────────────────────────────────────
  async function handleAddGarment(data) {
    // Add to orders collection for status tracking
    const orderId = await addOrder(data)
    // Also record the advance as income if any
    if (data.advancePaid > 0) {
      const txId = await addTransaction({
        type: 'income',
        businessUnit: 'garment',
        category: 'Sub-Order Income',
        description: `Advance — ${data.clientName}: ${data.description || ''}`,
        amount: data.advancePaid,
        date: data.date,
        metadata: { clientName: data.clientName, orderId, orderValue: data.orderValue },
      })
      setTransactions(prev => [{
        id: txId, type: 'income', businessUnit: 'garment', category: 'Sub-Order Income',
        description: `Advance — ${data.clientName}`, amount: data.advancePaid,
        date: new Date(data.date), createdAt: new Date(),
        metadata: { clientName: data.clientName }
      }, ...prev])
    }
    setOrders(prev => [{ id: orderId, ...data, date: new Date(data.date), createdAt: new Date() }, ...prev])
    setShowForm(false)
  }

  async function handleUpdateGarment(data) {
    await updateOrder(editItem.id, data)
    setOrders(prev => prev.map(o => o.id === editItem.id ? { ...o, ...data, date: new Date(data.date) } : o))
    setEditItem(null)
  }

  async function handleDeleteGarment(id) {
    await deleteOrder(id)
    setOrders(prev => prev.filter(o => o.id !== id))
  }

  const isShop = tab === 'shop'

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 animate-fade-in">
      {/* Tabs */}
      <div className="flex gap-1 border-b border-gold/10">
        <TabButton active={isShop} onClick={() => { setTab('shop'); setShowForm(false); setEditItem(null) }} icon={ShoppingBag}>
          Clothing Shop
        </TabButton>
        <TabButton active={!isShop} onClick={() => { setTab('garment'); setShowForm(false); setEditItem(null) }} icon={Scissors}>
          Garment Orders
        </TabButton>
      </div>

      {/* Header row */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="section-title truncate">{isShop ? 'Shop Income' : 'Garment Sub-Orders'}</h2>
          <p className="section-subtitle hidden sm:block">{isShop ? 'Sales from clothing items' : 'Manufacturing order tracking'}</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditItem(null) }} className="btn-primary flex items-center gap-2 flex-shrink-0">
          <Plus size={16} /> <span className="hidden sm:inline">Add </span>{isShop ? 'Income' : 'Order'}
        </button>
      </div>

      {/* ── Shop Income list ─────────────────────────────────────────────── */}
      {isShop && (
        <>
          {loadingTx ? <Spinner /> : shopIncome.length === 0 ? (
            <EmptyState title="No shop income yet" description="Record your first clothing sale by clicking Add Income." />
          ) : (
            <div className="card overflow-hidden">
              {/* Desktop table */}
              <table className="hidden sm:table w-full text-sm">
                <thead>
                  <tr className="border-b border-gold/10">
                    <Th>Date</Th><Th>Item</Th><Th>Qty</Th><Th>Unit Price</Th>
                    <Th>Total</Th><Th>Payment</Th><Th />
                  </tr>
                </thead>
                <tbody>
                  {shopIncome.map((t, i) => (
                    <tr key={t.id} className={`border-b border-gold/5 hover:bg-white/[0.03] transition-colors income-row ${i % 2 === 0 ? 'bg-white/[0.01]' : ''}`}>
                      <Td>{formatDate(t.date)}</Td>
                      <Td><span className="text-cream">{t.description}</span></Td>
                      <Td>{t.metadata?.quantity ?? '—'}</Td>
                      <Td>{t.metadata?.unitPrice ? formatCurrency(t.metadata.unitPrice) : '—'}</Td>
                      <Td><span className="text-green-400 font-medium">{formatCurrency(t.amount)}</span></Td>
                      <Td>{t.metadata?.paymentMethod || '—'}</Td>
                      <Td>
                        <div className="flex items-center gap-2 justify-end">
                          <ActionBtn icon={Edit2} onClick={() => { setEditItem(t); setShowForm(false) }} />
                          <ActionBtn icon={Trash2} danger onClick={() => setDeleteTarget({ id: t.id, type: 'shop' })} />
                        </div>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Mobile cards */}
              <div className="sm:hidden divide-y divide-gold/5">
                {shopIncome.map((t) => (
                  <div key={t.id} className="px-4 py-3 income-row flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-cream text-sm font-medium truncate">{t.description}</p>
                      <p className="text-cream-muted text-xs mt-0.5">{formatDate(t.date)} · {t.metadata?.paymentMethod || '—'}</p>
                      {t.metadata?.quantity && (
                        <p className="text-cream-dark text-[10px] mt-0.5">Qty {t.metadata.quantity} × {formatCurrency(t.metadata.unitPrice)}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className="text-green-400 font-semibold text-sm">{formatCurrency(t.amount)}</span>
                      <ActionBtn icon={Edit2} onClick={() => { setEditItem(t); setShowForm(false) }} />
                      <ActionBtn icon={Trash2} danger onClick={() => setDeleteTarget({ id: t.id, type: 'shop' })} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Garment Orders list ──────────────────────────────────────────── */}
      {!isShop && (
        <>
          {loadingOrd ? <Spinner /> : orders.length === 0 ? (
            <EmptyState title="No garment orders yet" description="Add your first manufacturing sub-order." />
          ) : (
            <div className="card overflow-hidden">
              {/* Desktop table */}
              <table className="hidden sm:table w-full text-sm">
                <thead>
                  <tr className="border-b border-gold/10">
                    <Th>Date</Th><Th>Client</Th><Th>Description</Th><Th>Order Value</Th>
                    <Th>Advance</Th><Th>Balance Due</Th><Th>Status</Th><Th />
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o, i) => (
                    <tr key={o.id} className={`border-b border-gold/5 hover:bg-white/[0.03] transition-colors income-row ${i % 2 === 0 ? 'bg-white/[0.01]' : ''}`}>
                      <Td>{formatDate(o.date)}</Td>
                      <Td><span className="text-cream">{o.clientName}</span></Td>
                      <Td><span className="text-cream-muted max-w-[140px] truncate block">{o.description || '—'}</span></Td>
                      <Td><span className="text-gold font-medium">{formatCurrency(o.orderValue)}</span></Td>
                      <Td>{formatCurrency(o.advancePaid)}</Td>
                      <Td><span className={o.balanceDue > 0 ? 'text-yellow-400' : 'text-green-400'}>{formatCurrency(o.balanceDue)}</span></Td>
                      <Td><StatusBadge status={o.status} /></Td>
                      <Td>
                        <div className="flex items-center gap-2 justify-end">
                          <ActionBtn icon={Edit2} onClick={() => { setEditItem(o); setShowForm(false) }} />
                          <ActionBtn icon={Trash2} danger onClick={() => setDeleteTarget({ id: o.id, type: 'garment' })} />
                        </div>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Mobile cards */}
              <div className="sm:hidden divide-y divide-gold/5">
                {orders.map((o) => (
                  <div key={o.id} className="px-4 py-3 income-row">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-cream text-sm font-medium">{o.clientName}</p>
                        <p className="text-cream-muted text-xs mt-0.5 truncate">{o.description || '—'}</p>
                        <p className="text-cream-dark text-[10px] mt-0.5">{formatDate(o.date)}</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <StatusBadge status={o.status} />
                        <ActionBtn icon={Edit2} onClick={() => { setEditItem(o); setShowForm(false) }} />
                        <ActionBtn icon={Trash2} danger onClick={() => setDeleteTarget({ id: o.id, type: 'garment' })} />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <div className="bg-charcoal/30 rounded p-1.5 text-center">
                        <p className="text-cream-dark text-[9px] uppercase tracking-wider">Value</p>
                        <p className="text-gold text-xs font-medium">{formatCurrency(o.orderValue)}</p>
                      </div>
                      <div className="bg-charcoal/30 rounded p-1.5 text-center">
                        <p className="text-cream-dark text-[9px] uppercase tracking-wider">Advance</p>
                        <p className="text-cream text-xs">{formatCurrency(o.advancePaid)}</p>
                      </div>
                      <div className="bg-charcoal/30 rounded p-1.5 text-center">
                        <p className="text-cream-dark text-[9px] uppercase tracking-wider">Balance</p>
                        <p className={`text-xs ${o.balanceDue > 0 ? 'text-yellow-400' : 'text-green-400'}`}>{formatCurrency(o.balanceDue)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Add Form Modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)}
        title={isShop ? 'New Shop Income Entry' : 'New Garment Order'} size="md">
        {isShop
          ? <ShopIncomeForm onSave={handleAddShop} onCancel={() => setShowForm(false)} />
          : <GarmentIncomeForm onSave={handleAddGarment} onCancel={() => setShowForm(false)} />
        }
      </Modal>

      {/* Edit Form Modal */}
      <Modal open={!!editItem} onClose={() => setEditItem(null)}
        title={isShop ? 'Edit Income Entry' : 'Edit Garment Order'} size="md">
        {editItem && isShop && (
          <ShopIncomeForm initial={editItem} onSave={handleUpdateShop} onCancel={() => setEditItem(null)} />
        )}
        {editItem && !isShop && (
          <GarmentIncomeForm initial={editItem} onSave={handleUpdateGarment} onCancel={() => setEditItem(null)} />
        )}
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget?.type === 'shop') handleDeleteShop(deleteTarget.id)
          else handleDeleteGarment(deleteTarget.id)
        }}
        title="Delete Entry"
        message="This action is permanent and cannot be undone. Are you sure you want to delete this entry?"
      />
    </div>
  )
}

// ─── Small helpers ────────────────────────────────────────────────────────────
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
