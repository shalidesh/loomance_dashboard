import React, { useEffect, useState, useMemo } from 'react'
import { Plus, Edit2, Trash2, Wallet, Users, Loader } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { addEmployee, updateEmployee, deleteEmployee, addTransaction } from '../firebase/services'
import Modal from '../components/UI/Modal'
import ConfirmDialog from '../components/UI/ConfirmDialog'
import EmptyState from '../components/UI/EmptyState'
import Spinner from '../components/UI/Spinner'
import { formatDate, formatCurrency, todayInputValue, formatDateInput } from '../utils/formatters'

const ROLES = ['Tailor', 'Cutter', 'Finisher', 'Quality Control', 'Machine Operator', 'Helper', 'Supervisor', 'Other']

// ─── Employee Form ────────────────────────────────────────────────────────────
function EmployeeForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: '',
    role: 'Tailor',
    dailyWage: '',
    monthlyWage: '',
    phone: '',
    notes: '',
    ...initial,
  })
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name || !form.role) return
    setSaving(true)
    try {
      await onSave(form)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Full Name *</label>
          <input type="text" className="input-field" placeholder="Employee name" value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
        </div>
        <div>
          <label className="label">Role *</label>
          <select className="input-field" value={form.role}
            onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
            {ROLES.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Daily Wage (Rs.)</label>
          <input type="number" min="0" step="0.01" className="input-field" placeholder="0.00" value={form.dailyWage}
            onChange={e => setForm(f => ({
              ...f,
              dailyWage: e.target.value,
              monthlyWage: e.target.value ? (Number(e.target.value) * 26).toFixed(0) : f.monthlyWage,
            }))} />
        </div>
        <div>
          <label className="label">Monthly Wage (Rs.)</label>
          <input type="number" min="0" step="0.01" className="input-field" placeholder="0.00" value={form.monthlyWage}
            onChange={e => setForm(f => ({ ...f, monthlyWage: e.target.value }))} />
        </div>
      </div>

      <div>
        <label className="label">Phone</label>
        <input type="tel" className="input-field" placeholder="Optional contact number" value={form.phone}
          onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
      </div>

      <div>
        <label className="label">Notes</label>
        <textarea className="input-field resize-none" rows={2} value={form.notes}
          onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-ghost">Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
          {saving && <Loader size={14} className="animate-spin" />}
          {initial ? 'Update Employee' : 'Add Employee'}
        </button>
      </div>
    </form>
  )
}

// ─── Wage Payment Form ────────────────────────────────────────────────────────
function WagePaymentForm({ employee, onSave, onCancel }) {
  const now = new Date()
  const [form, setForm] = useState({
    date: todayInputValue(),
    amount: employee.monthlyWage || '',
    month: now.toLocaleString('default', { month: 'long' }),
    year: String(now.getFullYear()),
    notes: '',
  })
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.amount || Number(form.amount) <= 0) return
    setSaving(true)
    try {
      await onSave({
        type: 'expense',
        businessUnit: 'garment',
        category: 'Employee Wages',
        description: `Wages — ${employee.name} (${form.month} ${form.year})`,
        amount: Number(form.amount),
        date: form.date,
        metadata: {
          employeeId: employee.id,
          employeeName: employee.name,
          month: form.month,
          year: form.year,
          notes: form.notes,
        },
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-3 p-3 bg-gold/5 border border-gold/20 rounded-lg mb-2">
        <div className="w-9 h-9 bg-gold/20 rounded-full flex items-center justify-center font-serif text-gold font-bold">
          {employee.name[0]}
        </div>
        <div>
          <p className="text-cream text-sm font-medium">{employee.name}</p>
          <p className="text-cream-muted text-xs">{employee.role}</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-cream-dark text-[10px]">Monthly Wage</p>
          <p className="text-gold text-sm font-serif">{formatCurrency(employee.monthlyWage)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Payment Date *</label>
          <input type="date" className="input-field" value={form.date}
            onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required />
        </div>
        <div>
          <label className="label">Amount (Rs.) *</label>
          <input type="number" min="0.01" step="0.01" className="input-field" value={form.amount}
            onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">For Month</label>
          <input type="text" className="input-field" value={form.month}
            onChange={e => setForm(f => ({ ...f, month: e.target.value }))} />
        </div>
        <div>
          <label className="label">Year</label>
          <input type="text" className="input-field" value={form.year}
            onChange={e => setForm(f => ({ ...f, year: e.target.value }))} />
        </div>
      </div>

      <div>
        <label className="label">Notes</label>
        <textarea className="input-field resize-none" rows={2} placeholder="Optional notes..."
          value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-ghost">Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
          {saving && <Loader size={14} className="animate-spin" />}
          Record Payment
        </button>
      </div>
    </form>
  )
}

// ─── Employee Card ────────────────────────────────────────────────────────────
function EmployeeCard({ emp, wageHistory, onEdit, onDelete, onPay }) {
  const totalPaid = wageHistory
    .filter(t => t.metadata?.employeeId === emp.id || t.metadata?.employeeName === emp.name)
    .reduce((s, t) => s + (Number(t.amount) || 0), 0)

  return (
    <div className="card p-5 animate-fade-in">
      {/* Avatar + name */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-gold/30 to-gold/10 border border-gold/30 rounded-full flex items-center justify-center font-serif text-gold text-lg font-bold flex-shrink-0">
            {emp.name[0]?.toUpperCase()}
          </div>
          <div>
            <h3 className="text-cream font-medium text-sm">{emp.name}</h3>
            <p className="text-cream-muted text-xs mt-0.5">{emp.role}</p>
            {emp.phone && <p className="text-cream-dark text-[10px] mt-0.5">{emp.phone}</p>}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={onEdit}
            className="p-1.5 rounded hover:text-gold hover:bg-gold/10 text-cream-dark transition-colors">
            <Edit2 size={13} />
          </button>
          <button onClick={onDelete}
            className="p-1.5 rounded hover:text-red-400 hover:bg-red-400/10 text-cream-dark transition-colors">
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Wage info */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-charcoal/40 rounded-lg p-3">
          <p className="text-cream-dark text-[9px] uppercase tracking-widest mb-1">Daily Wage</p>
          <p className="text-gold font-serif text-sm">{emp.dailyWage ? formatCurrency(emp.dailyWage) : '—'}</p>
        </div>
        <div className="bg-charcoal/40 rounded-lg p-3">
          <p className="text-cream-dark text-[9px] uppercase tracking-widest mb-1">Monthly Wage</p>
          <p className="text-gold font-serif text-sm">{emp.monthlyWage ? formatCurrency(emp.monthlyWage) : '—'}</p>
        </div>
      </div>

      {/* Total paid tracker */}
      <div className="flex items-center justify-between p-3 bg-green-500/5 border border-green-500/15 rounded-lg mb-4">
        <span className="text-cream-dark text-xs">Total Wages Paid</span>
        <span className="text-green-400 font-serif text-sm">{formatCurrency(totalPaid)}</span>
      </div>

      {/* Pay button */}
      <button onClick={onPay} className="btn-secondary w-full flex items-center justify-center gap-2 text-xs">
        <Wallet size={13} /> Record Wage Payment
      </button>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Employees() {
  const [showForm, setShowForm] = useState(false)
  const [editEmployee, setEditEmployee] = useState(null)
  const [payEmployee, setPayEmployee] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const { employees, transactions, loadingEmp, fetchEmployees, fetchTransactions, setEmployees, setTransactions } = useApp()

  useEffect(() => {
    fetchEmployees()
    fetchTransactions()
  }, [fetchEmployees, fetchTransactions])

  const wageHistory = useMemo(
    () => transactions.filter(t => t.category === 'Employee Wages' && t.businessUnit === 'garment'),
    [transactions]
  )

  // Total wages this month
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const thisMonthWages = wageHistory.filter(t => {
    const d = t.date instanceof Date ? t.date : new Date(t.date)
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear
  }).reduce((s, t) => s + (Number(t.amount) || 0), 0)

  async function handleAdd(data) {
    const id = await addEmployee(data)
    setEmployees(prev => [...prev, { id, ...data, createdAt: new Date() }])
    setShowForm(false)
  }

  async function handleUpdate(data) {
    await updateEmployee(editEmployee.id, data)
    setEmployees(prev => prev.map(e => e.id === editEmployee.id ? { ...e, ...data } : e))
    setEditEmployee(null)
  }

  async function handleDelete(id) {
    await deleteEmployee(id)
    setEmployees(prev => prev.filter(e => e.id !== id))
    setDeleteTarget(null)
  }

  async function handlePayWage(data) {
    const id = await addTransaction(data)
    setTransactions(prev => [{ id, ...data, date: new Date(data.date), createdAt: new Date() }, ...prev])
    setPayEmployee(null)
  }

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="section-title">Employees</h2>
          <p className="section-subtitle hidden sm:block">Garment division workforce management</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 flex-shrink-0">
          <Plus size={16} /> Add Employee
        </button>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="card p-2 sm:p-4 flex items-center gap-2 sm:gap-3">
          <Users size={16} className="text-gold flex-shrink-0 sm:w-5 sm:h-5" />
          <div className="min-w-0">
            <p className="text-cream-dark text-[8px] sm:text-[10px] uppercase tracking-widest truncate">Staff</p>
            <p className="text-cream font-serif text-base sm:text-xl">{employees.length}</p>
          </div>
        </div>
        <div className="card p-2 sm:p-4 flex items-center gap-2 sm:gap-3">
          <Wallet size={16} className="text-red-400 flex-shrink-0 sm:w-5 sm:h-5" />
          <div className="min-w-0">
            <p className="text-cream-dark text-[8px] sm:text-[10px] uppercase tracking-widest truncate">This Month</p>
            <p className="text-red-400 font-serif text-sm sm:text-lg truncate">{formatCurrency(thisMonthWages)}</p>
          </div>
        </div>
        <div className="card p-2 sm:p-4 flex items-center gap-2 sm:gap-3">
          <Wallet size={16} className="text-gold flex-shrink-0 sm:w-5 sm:h-5" />
          <div className="min-w-0">
            <p className="text-cream-dark text-[8px] sm:text-[10px] uppercase tracking-widest truncate">Total Paid</p>
            <p className="text-gold font-serif text-sm sm:text-lg truncate">{formatCurrency(wageHistory.reduce((s, t) => s + (Number(t.amount) || 0), 0))}</p>
          </div>
        </div>
      </div>

      {/* Employee Cards */}
      {loadingEmp ? <Spinner /> : employees.length === 0 ? (
        <EmptyState icon={Users} title="No employees yet" description="Add garment division staff to track wages and payments." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {employees.map(emp => (
            <EmployeeCard
              key={emp.id}
              emp={emp}
              wageHistory={wageHistory}
              onEdit={() => setEditEmployee(emp)}
              onDelete={() => setDeleteTarget(emp.id)}
              onPay={() => setPayEmployee(emp)}
            />
          ))}
        </div>
      )}

      {/* Wage History */}
      {wageHistory.length > 0 && (
        <>
          <div className="gold-divider" />
          <div>
            <h3 className="font-serif text-lg text-cream mb-4">Wage Payment History</h3>
            <div className="card overflow-hidden">
              {/* Desktop table */}
              <table className="hidden sm:table w-full text-sm">
                <thead>
                  <tr className="border-b border-gold/10">
                    <Th>Date</Th><Th>Employee</Th><Th>Period</Th><Th>Amount</Th>
                  </tr>
                </thead>
                <tbody>
                  {wageHistory.slice(0, 20).map((t, i) => (
                    <tr key={t.id} className={`border-b border-gold/5 hover:bg-white/[0.03] ${i % 2 === 0 ? 'bg-white/[0.01]' : ''}`}>
                      <Td>{formatDate(t.date)}</Td>
                      <Td><span className="text-cream">{t.metadata?.employeeName || '—'}</span></Td>
                      <Td className="text-cream-muted">{t.metadata?.month} {t.metadata?.year}</Td>
                      <Td><span className="text-red-400 font-medium">{formatCurrency(t.amount)}</span></Td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Mobile cards */}
              <div className="sm:hidden divide-y divide-gold/5">
                {wageHistory.slice(0, 20).map((t) => (
                  <div key={t.id} className="px-4 py-3 expense-row flex items-center justify-between gap-2">
                    <div>
                      <p className="text-cream text-sm font-medium">{t.metadata?.employeeName || '—'}</p>
                      <p className="text-cream-muted text-xs mt-0.5">{t.metadata?.month} {t.metadata?.year} · {formatDate(t.date)}</p>
                    </div>
                    <span className="text-red-400 font-semibold text-sm flex-shrink-0">{formatCurrency(t.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modals */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title="Add Employee" size="md">
        <EmployeeForm onSave={handleAdd} onCancel={() => setShowForm(false)} />
      </Modal>

      <Modal open={!!editEmployee} onClose={() => setEditEmployee(null)} title="Edit Employee" size="md">
        {editEmployee && (
          <EmployeeForm initial={editEmployee} onSave={handleUpdate} onCancel={() => setEditEmployee(null)} />
        )}
      </Modal>

      <Modal open={!!payEmployee} onClose={() => setPayEmployee(null)} title="Record Wage Payment" size="md">
        {payEmployee && (
          <WagePaymentForm employee={payEmployee} onSave={handlePayWage} onCancel={() => setPayEmployee(null)} />
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => handleDelete(deleteTarget)}
        title="Remove Employee"
        message="This will remove the employee record. Wage payment history will be preserved in transactions."
        confirmLabel="Remove"
      />
    </div>
  )
}

function Th({ children }) {
  return <th className="text-left text-cream-dark text-[10px] uppercase tracking-widest px-4 py-3 font-medium">{children}</th>
}
function Td({ children }) {
  return <td className="px-4 py-3 text-cream-muted text-xs">{children}</td>
}
