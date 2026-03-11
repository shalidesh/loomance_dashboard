import { jsPDF } from 'jspdf'
import { formatDate, formatCurrency, unitLabel } from './formatters'

export function exportToPDF(transactions, summary, options = {}) {
  const { dateRange, businessUnit = 'all', title = 'Financial Report' } = options
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const W = doc.internal.pageSize.getWidth()
  const H = doc.internal.pageSize.getHeight()

  // ── Header band ────────────────────────────────────────────────────────────
  doc.setFillColor(26, 26, 46)
  doc.rect(0, 0, W, 44, 'F')

  // Gold accent line
  doc.setDrawColor(201, 169, 110)
  doc.setLineWidth(0.5)
  doc.line(14, 44, W - 14, 44)

  // Company name
  doc.setTextColor(201, 169, 110)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('LOOMANCE CLOTHING', W / 2, 16, { align: 'center' })

  // Tagline
  doc.setTextColor(184, 169, 154)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'italic')
  doc.text('Where fabric meets finesse', W / 2, 23, { align: 'center' })

  // Report title
  doc.setTextColor(245, 240, 232)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(title, W / 2, 31, { align: 'center' })

  // Period
  if (dateRange) {
    const periodText = `${formatDate(dateRange.start)} — ${formatDate(dateRange.end)}`
    doc.setFontSize(8)
    doc.setTextColor(184, 169, 154)
    doc.text(periodText, W / 2, 38, { align: 'center' })
  }

  // Unit filter
  doc.setTextColor(201, 169, 110)
  doc.setFontSize(7)
  doc.text(unitLabel(businessUnit).toUpperCase(), W - 14, 38, { align: 'right' })

  let y = 56

  // ── Summary Section ─────────────────────────────────────────────────────────
  doc.setFillColor(22, 33, 62)
  doc.roundedRect(14, y - 6, W - 28, 36, 3, 3, 'F')
  doc.setDrawColor(201, 169, 110)
  doc.setLineWidth(0.3)
  doc.roundedRect(14, y - 6, W - 28, 36, 3, 3, 'S')

  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(201, 169, 110)
  doc.text('FINANCIAL SUMMARY', 20, y)
  y += 8

  const summaryItems = [
    ['Total Revenue', formatCurrency(summary.totalIncome), [74, 222, 128]],
    ['Total Expenses', formatCurrency(summary.totalExpenses), [248, 113, 113]],
    ['Net Profit / Loss', formatCurrency(summary.netProfit), summary.netProfit >= 0 ? [74, 222, 128] : [248, 113, 113]],
  ]

  const colW = (W - 28) / 3
  summaryItems.forEach(([label, value, color], i) => {
    const x = 20 + i * colW
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(184, 169, 154)
    doc.text(label.toUpperCase(), x, y)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...color)
    doc.text(value, x, y + 8)
  })

  y += 22

  // ── Transactions Table ──────────────────────────────────────────────────────
  y += 4
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(245, 240, 232)
  doc.text('TRANSACTION LEDGER', 14, y)
  y += 6

  // Table header
  const cols = [14, 36, 66, 100, 130, 160, W - 14]
  const headers = ['Date', 'Unit', 'Category', 'Description', 'Type', 'Amount']

  doc.setFillColor(26, 26, 46)
  doc.rect(14, y - 4, W - 28, 8, 'F')
  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(201, 169, 110)

  headers.forEach((h, i) => {
    if (i < headers.length - 1) doc.text(h, cols[i] + 1, y)
    else doc.text(h, cols[i], y, { align: 'right' })
  })

  y += 6

  // Table rows
  doc.setFont('helvetica', 'normal')
  let rowIdx = 0

  transactions.forEach((t) => {
    if (y > H - 20) {
      doc.addPage()
      y = 20
    }

    if (rowIdx % 2 === 0) {
      doc.setFillColor(22, 33, 62)
      doc.rect(14, y - 4, W - 28, 7, 'F')
    }

    // Income/expense indicator bar
    if (t.type === 'income') doc.setFillColor(74, 222, 128)
    else doc.setFillColor(248, 113, 113)
    doc.rect(14, y - 4, 1.5, 7, 'F')

    doc.setFontSize(7)
    doc.setTextColor(184, 169, 154)
    doc.text(formatDate(t.date), cols[0] + 3, y)
    doc.text(t.businessUnit === 'shop' ? 'Shop' : 'Garment', cols[1] + 1, y)
    doc.text(truncate(t.category || '', 16), cols[2] + 1, y)
    doc.text(truncate(t.description || '', 18), cols[3] + 1, y)

    if (t.type === 'income') doc.setTextColor(74, 222, 128)
    else doc.setTextColor(248, 113, 113)
    doc.text(t.type === 'income' ? 'Income' : 'Expense', cols[4] + 1, y)

    doc.setTextColor(245, 240, 232)
    doc.text(formatCurrency(t.amount), cols[5], y, { align: 'right' })

    y += 7
    rowIdx++
  })

  // ── Footer ──────────────────────────────────────────────────────────────────
  doc.setDrawColor(201, 169, 110)
  doc.setLineWidth(0.3)
  doc.line(14, H - 14, W - 14, H - 14)
  doc.setFontSize(7)
  doc.setTextColor(138, 122, 110)
  doc.text(`Generated ${formatDate(new Date())} | Loomance Clothing Dashboard`, W / 2, H - 8, { align: 'center' })

  const dateStr = new Date().toISOString().slice(0, 10)
  doc.save(`loomance-report-${dateStr}.pdf`)
}

function truncate(str, n) {
  return str.length > n ? str.slice(0, n - 1) + '…' : str
}
