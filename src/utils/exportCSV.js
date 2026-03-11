import Papa from 'papaparse'
import { formatDate, unitLabel } from './formatters'

export function exportToCSV(transactions, filename = 'loomance-report') {
  const rows = transactions.map((t) => ({
    Date: formatDate(t.date),
    Type: t.type === 'income' ? 'Income' : 'Expense',
    'Business Unit': unitLabel(t.businessUnit),
    Category: t.category || '',
    Description: t.description || '',
    'Amount (LKR)': Number(t.amount || 0).toFixed(2),
    'Payment Method': t.metadata?.paymentMethod || '',
    'Client/Supplier': t.metadata?.clientName || t.metadata?.supplierName || '',
    Notes: t.metadata?.notes || '',
  }))

  const csv = Papa.unparse(rows)
  downloadFile(
    csv,
    `${filename}-${new Date().toISOString().slice(0, 10)}.csv`,
    'text/csv;charset=utf-8;'
  )
}

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
