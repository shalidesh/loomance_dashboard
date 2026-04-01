import { jsPDF } from 'jspdf'
import { formatDate, formatCurrency } from './formatters'

export function exportSalarySlip(employee, records, period) {
  // records: attendance records for this employee for the period (already filtered)
  // period: { label: 'April 2026', year: number, month: number }

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const W = doc.internal.pageSize.getWidth()
  const H = doc.internal.pageSize.getHeight()

  // ── Header band ─────────────────────────────────────────────────────────────
  doc.setFillColor(26, 26, 46)
  doc.rect(0, 0, W, 44, 'F')
  doc.setDrawColor(201, 169, 110)
  doc.setLineWidth(0.5)
  doc.line(14, 44, W - 14, 44)

  doc.setTextColor(201, 169, 110)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('LOOMANCE CLOTHING', W / 2, 16, { align: 'center' })

  doc.setTextColor(184, 169, 154)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'italic')
  doc.text('Where fabric meets finesse', W / 2, 23, { align: 'center' })

  doc.setTextColor(245, 240, 232)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text('SALARY SLIP', W / 2, 31, { align: 'center' })

  doc.setTextColor(184, 169, 154)
  doc.setFontSize(8)
  doc.text(period.label, W / 2, 38, { align: 'center' })

  let y = 56

  // ── Employee Info Panel ──────────────────────────────────────────────────────
  doc.setFillColor(22, 33, 62)
  doc.roundedRect(14, y - 6, W - 28, 30, 3, 3, 'F')
  doc.setDrawColor(201, 169, 110)
  doc.setLineWidth(0.3)
  doc.roundedRect(14, y - 6, W - 28, 30, 3, 3, 'S')

  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(201, 169, 110)
  doc.text('EMPLOYEE', 20, y)
  y += 6

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(245, 240, 232)
  doc.text(employee.name, 20, y)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(184, 169, 154)
  doc.text(employee.role, 20, y + 6)

  // Rates on right
  doc.setFontSize(8)
  doc.setTextColor(201, 169, 110)
  doc.setFont('helvetica', 'bold')
  doc.text('RATES', W - 20, y - 6, { align: 'right' })
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(184, 169, 154)
  doc.text(`Regular: ${formatCurrency(employee.hourlyRate || 0)}/hr`, W - 20, y, { align: 'right' })
  doc.text(`Overtime: ${formatCurrency(employee.overtimeRate || 0)}/hr`, W - 20, y + 6, { align: 'right' })

  y += 22

  // ── Attendance Table ─────────────────────────────────────────────────────────
  y += 6
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(245, 240, 232)
  doc.text('ATTENDANCE RECORD', 14, y)
  y += 6

  const cols = [14, 40, 68, 96, 124, 152]
  const headers = ['Date', 'Day', 'Check In', 'Check Out', 'Reg. Hrs', 'OT Hrs']

  doc.setFillColor(26, 26, 46)
  doc.rect(14, y - 4, W - 28, 8, 'F')
  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(201, 169, 110)
  headers.forEach((h, i) => doc.text(h, cols[i] + 1, y))
  y += 6

  doc.setFont('helvetica', 'normal')
  let rowIdx = 0
  let totalRegHours = 0
  let totalOTHours = 0
  let daysWorked = 0

  const sorted = [...records].sort((a, b) => (a.date || 0) - (b.date || 0))

  sorted.forEach(r => {
    if (y > H - 55) {
      doc.addPage()
      y = 20
    }

    if (rowIdx % 2 === 0) {
      doc.setFillColor(22, 33, 62)
      doc.rect(14, y - 4, W - 28, 7, 'F')
    }

    const dateObj = r.date instanceof Date ? r.date : new Date(r.date)
    const dayName = isNaN(dateObj) ? '' : dateObj.toLocaleDateString('en-LK', { weekday: 'short' })

    doc.setFontSize(7)
    doc.setTextColor(184, 169, 154)
    doc.text(formatDate(r.date), cols[0] + 1, y)
    doc.text(dayName, cols[1] + 1, y)
    doc.text(r.checkIn || '—', cols[2] + 1, y)
    doc.text(r.checkOut || '—', cols[3] + 1, y)

    doc.setTextColor(74, 222, 128)
    doc.text(String((r.regularHours || 0).toFixed(2)), cols[4] + 1, y)

    doc.setTextColor(r.overtimeHours > 0 ? 201 : 184, r.overtimeHours > 0 ? 169 : 169, r.overtimeHours > 0 ? 110 : 154)
    doc.text(String((r.overtimeHours || 0).toFixed(2)), cols[5] + 1, y)

    totalRegHours += Number(r.regularHours || 0)
    totalOTHours += Number(r.overtimeHours || 0)
    daysWorked++
    y += 7
    rowIdx++
  })

  // Totals row
  if (y > H - 55) { doc.addPage(); y = 20 }
  doc.setFillColor(26, 26, 46)
  doc.rect(14, y - 4, W - 28, 8, 'F')
  doc.setDrawColor(201, 169, 110)
  doc.setLineWidth(0.2)
  doc.line(14, y - 4, W - 14, y - 4)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(201, 169, 110)
  doc.text(`TOTAL  (${daysWorked} days)`, cols[0] + 1, y)
  doc.setTextColor(74, 222, 128)
  doc.text(totalRegHours.toFixed(2), cols[4] + 1, y)
  doc.setTextColor(201, 169, 110)
  doc.text(totalOTHours.toFixed(2), cols[5] + 1, y)
  y += 14

  // ── Pay Breakdown ────────────────────────────────────────────────────────────
  if (y > H - 60) { doc.addPage(); y = 20 }

  const regularPay = totalRegHours * (Number(employee.hourlyRate) || 0)
  const overtimePay = totalOTHours * (Number(employee.overtimeRate) || 0)
  const totalPay = regularPay + overtimePay

  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(245, 240, 232)
  doc.text('PAY BREAKDOWN', 14, y)
  y += 6

  doc.setFillColor(22, 33, 62)
  doc.roundedRect(14, y - 6, W - 28, 46, 3, 3, 'F')
  doc.setDrawColor(201, 169, 110)
  doc.setLineWidth(0.3)
  doc.roundedRect(14, y - 6, W - 28, 46, 3, 3, 'S')

  const payRows = [
    ['Regular Pay', `${totalRegHours.toFixed(2)} hrs × ${formatCurrency(employee.hourlyRate || 0)}`, formatCurrency(regularPay), [74, 222, 128]],
    ['Overtime Pay', `${totalOTHours.toFixed(2)} hrs × ${formatCurrency(employee.overtimeRate || 0)}`, formatCurrency(overtimePay), [201, 169, 110]],
  ]

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  payRows.forEach(([label, detail, amount, color]) => {
    doc.setTextColor(184, 169, 154)
    doc.text(label, 20, y)
    doc.text(detail, 65, y)
    doc.setTextColor(...color)
    doc.text(amount, W - 20, y, { align: 'right' })
    y += 9
  })

  doc.setDrawColor(201, 169, 110)
  doc.setLineWidth(0.3)
  doc.line(20, y, W - 20, y)
  y += 6

  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(201, 169, 110)
  doc.text('NET SALARY', 20, y)
  doc.setTextColor(74, 222, 128)
  doc.text(formatCurrency(totalPay), W - 20, y, { align: 'right' })
  y += 18

  // ── Signature Lines ──────────────────────────────────────────────────────────
  if (y > H - 28) { doc.addPage(); y = 20 }
  doc.setDrawColor(184, 169, 154)
  doc.setLineWidth(0.3)
  doc.line(20, y, 75, y)
  doc.line(W - 75, y, W - 20, y)
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(138, 122, 110)
  doc.text('Employee Signature', 20, y + 5)
  doc.text('Authorized Signature', W - 75, y + 5)

  // ── Footer ───────────────────────────────────────────────────────────────────
  doc.setDrawColor(201, 169, 110)
  doc.setLineWidth(0.3)
  doc.line(14, H - 14, W - 14, H - 14)
  doc.setFontSize(7)
  doc.setTextColor(138, 122, 110)
  doc.text(
    `Generated ${formatDate(new Date())} | Loomance Clothing Dashboard`,
    W / 2, H - 8, { align: 'center' }
  )

  const safeName = employee.name.replace(/\s+/g, '-').toLowerCase()
  const safePeriod = period.label.replace(/\s+/g, '-').toLowerCase()
  doc.save(`salary-slip-${safeName}-${safePeriod}.pdf`)
}
