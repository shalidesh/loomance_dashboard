import { format, isValid } from 'date-fns'

// ─── Currency ─────────────────────────────────────────────────────────────────

export function formatCurrency(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return 'Rs. 0.00'
  return `Rs. ${Number(amount).toLocaleString('en-LK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function formatCurrencyShort(amount) {
  if (!amount) return 'Rs. 0'
  const n = Number(amount)
  if (n >= 1_000_000) return `Rs. ${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `Rs. ${(n / 1_000).toFixed(1)}K`
  return `Rs. ${n.toFixed(0)}`
}

// ─── Dates ────────────────────────────────────────────────────────────────────

export function formatDate(date) {
  if (!date) return '—'
  const d = date instanceof Date ? date : new Date(date)
  if (!isValid(d)) return '—'
  return format(d, 'dd/MM/yyyy')
}

export function formatDateInput(date) {
  if (!date) return ''
  const d = date instanceof Date ? date : new Date(date)
  if (!isValid(d)) return ''
  return format(d, 'yyyy-MM-dd')
}

export function formatMonthYear(date) {
  if (!date) return ''
  const d = date instanceof Date ? date : new Date(date)
  if (!isValid(d)) return ''
  return format(d, 'MMM yyyy')
}

export function todayInputValue() {
  return format(new Date(), 'yyyy-MM-dd')
}

// ─── Chart Data ───────────────────────────────────────────────────────────────

export function getMonthlyChartData(transactions, months = 6) {
  const now = new Date()
  const result = []

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const label = format(d, 'MMM yy')
    const monthKey = format(d, 'yyyy-MM')
    result.push({ month: label, monthKey, income: 0, expenses: 0 })
  }

  transactions.forEach((t) => {
    if (!t.date) return
    const key = format(t.date instanceof Date ? t.date : new Date(t.date), 'yyyy-MM')
    const slot = result.find((r) => r.monthKey === key)
    if (!slot) return
    if (t.type === 'income') slot.income += Number(t.amount) || 0
    else slot.expenses += Number(t.amount) || 0
  })

  return result
}

// ─── Summary Calculations ─────────────────────────────────────────────────────

export function calcSummary(transactions) {
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + (Number(t.amount) || 0), 0)

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + (Number(t.amount) || 0), 0)

  return {
    totalIncome,
    totalExpenses,
    netProfit: totalIncome - totalExpenses,
  }
}

// ─── Business Unit Label ──────────────────────────────────────────────────────

export function unitLabel(unit) {
  if (unit === 'shop') return 'Clothing Shop'
  if (unit === 'garment') return 'Garment'
  return 'All Units'
}
