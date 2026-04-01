import React, { useEffect, useState, useMemo } from 'react'
import {
  CalendarDays, Clock, DollarSign, Settings, Download,
  Loader, ChevronLeft, ChevronRight, Users, Save,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import Spinner from '../components/UI/Spinner'
import EmptyState from '../components/UI/EmptyState'
import { formatCurrency, formatDate, todayInputValue } from '../utils/formatters'
import {
  saveAttendanceRecord,
  getAttendanceForDate,
  getAttendanceForMonth,
  deleteAttendanceRecord,
  saveAttendanceSettings,
  updateEmployeeRates,
} from '../firebase/services'
import { exportSalarySlip } from '../utils/exportSalarySlip'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toMins(t) {
  const [h, m] = (t || '00:00').split(':').map(Number)
  return (isNaN(h) ? 0 : h) * 60 + (isNaN(m) ? 0 : m)
}

function calcHours(checkIn, checkOut, workStart, workEnd) {
  const inMins = toMins(checkIn)
  const outMins = toMins(checkOut)
  if (outMins <= inMins) return { regularHours: 0, overtimeHours: 0 }
  const totalMins = outMins - inMins
  const standardMins = toMins(workEnd) - toMins(workStart)
  return {
    regularHours: Math.round(Math.min(totalMins, standardMins) / 60 * 100) / 100,
    overtimeHours: Math.round(Math.max(0, totalMins - standardMins) / 60 * 100) / 100,
  }
}

function monthLabel(year, month) {
  return new Date(year, month, 1).toLocaleString('en-LK', { month: 'long', year: 'numeric' })
}

// ─── Daily Attendance Tab ──────────────────────────────────────────────────────

function DailyTab({ employees, settings }) {
  const [selectedDate, setSelectedDate] = useState(todayInputValue())
  const [dateRecords, setDateRecords] = useState([])
  const [loadingDate, setLoadingDate] = useState(false)
  const [formRows, setFormRows] = useState([])
  const [saving, setSaving] = useState(false)

  // Fetch records for the selected date
  useEffect(() => {
    if (employees.length === 0) return
    setLoadingDate(true)
    getAttendanceForDate(employees.map(e => e.id), selectedDate)
      .then(setDateRecords)
      .catch(err => console.error('getAttendanceForDate:', err))
      .finally(() => setLoadingDate(false))
  }, [selectedDate, employees])

  // Build editable form rows whenever records or employees change
  useEffect(() => {
    setFormRows(employees.map(emp => {
      const existing = dateRecords.find(a => a.employeeId === emp.id)
      return {
        employeeId: emp.id,
        employeeName: emp.name,
        role: emp.role,
        present: !!existing,
        checkIn: existing?.checkIn || settings.workStart || '09:00',
        checkOut: existing?.checkOut || settings.workEnd || '17:00',
        regularHours: existing?.regularHours || 0,
        overtimeHours: existing?.overtimeHours || 0,
        notes: existing?.notes || '',
        docId: existing?.id || null,
      }
    }))
  }, [dateRecords, employees, settings])

  function updateRow(idx, changes) {
    setFormRows(prev => {
      const next = [...prev]
      const updated = { ...next[idx], ...changes }
      if ('checkIn' in changes || 'checkOut' in changes) {
        const hours = calcHours(
          changes.checkIn ?? next[idx].checkIn,
          changes.checkOut ?? next[idx].checkOut,
          settings.workStart || '09:00',
          settings.workEnd || '17:00',
        )
        Object.assign(updated, hours)
      }
      next[idx] = updated
      return next
    })
  }

  async function handleSave() {
    setSaving(true)
    try {
      await Promise.all(formRows.map(async row => {
        if (row.present) {
          await saveAttendanceRecord(row.employeeId, selectedDate, {
            employeeName: row.employeeName,
            checkIn: row.checkIn,
            checkOut: row.checkOut,
            regularHours: row.regularHours,
            overtimeHours: row.overtimeHours,
            notes: row.notes,
          })
        } else if (row.docId) {
          await deleteAttendanceRecord(row.docId)
        }
      }))
      // Reload to reflect saved state
      const refreshed = await getAttendanceForDate(employees.map(e => e.id), selectedDate)
      setDateRecords(refreshed)
    } finally {
      setSaving(false)
    }
  }

  if (employees.length === 0) return (
    <EmptyState icon={Users} title="No employees" description="Add employees in the Employees page first." />
  )

  return (
    <div className="space-y-4">
      {/* Date selector + save */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <CalendarDays size={15} className="text-gold" />
          <input type="date" className="input-field w-auto" value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)} />
        </div>
        <div className="ml-auto flex items-center gap-2">
          {loadingDate && <Loader size={14} className="animate-spin text-cream-muted" />}
          <button onClick={handleSave} disabled={saving || loadingDate}
            className="btn-primary flex items-center gap-2">
            {saving ? <Loader size={14} className="animate-spin" /> : <Save size={14} />}
            Save Attendance
          </button>
        </div>
      </div>

      {/* Desktop table */}
      <div className="card overflow-x-auto hidden sm:block">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="border-b border-gold/10">
              <Th>Employee</Th>
              <Th>Present</Th>
              <Th>Check In</Th>
              <Th>Check Out</Th>
              <Th>Reg. Hours</Th>
              <Th>OT Hours</Th>
              <Th>Notes</Th>
            </tr>
          </thead>
          <tbody>
            {formRows.map((row, i) => (
              <tr key={row.employeeId}
                className={`border-b border-gold/5 ${i % 2 === 0 ? 'bg-white/[0.01]' : ''}`}>
                <td className="px-4 py-3">
                  <p className="text-cream text-xs font-medium">{row.employeeName}</p>
                  <p className="text-cream-dark text-[10px]">{row.role}</p>
                </td>
                <td className="px-4 py-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={row.present}
                      onChange={e => updateRow(i, { present: e.target.checked })}
                      className="w-4 h-4 accent-gold" />
                    <span className={`text-xs ${row.present ? 'text-green-400' : 'text-cream-dark'}`}>
                      {row.present ? 'Present' : 'Absent'}
                    </span>
                  </label>
                </td>
                <td className="px-4 py-3">
                  <input type="time" value={row.checkIn} disabled={!row.present}
                    className={`input-field text-xs py-1 w-28 ${!row.present ? 'opacity-40' : ''}`}
                    onChange={e => updateRow(i, { checkIn: e.target.value })} />
                </td>
                <td className="px-4 py-3">
                  <input type="time" value={row.checkOut} disabled={!row.present}
                    className={`input-field text-xs py-1 w-28 ${!row.present ? 'opacity-40' : ''}`}
                    onChange={e => updateRow(i, { checkOut: e.target.value })} />
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium ${row.present ? 'text-green-400' : 'text-cream-dark'}`}>
                    {row.present ? `${row.regularHours}h` : '—'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium ${row.present && row.overtimeHours > 0 ? 'text-gold' : 'text-cream-dark'}`}>
                    {row.present ? `${row.overtimeHours}h` : '—'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <input type="text" placeholder="Optional notes" value={row.notes}
                    disabled={!row.present}
                    className={`input-field text-xs py-1 ${!row.present ? 'opacity-40' : ''}`}
                    onChange={e => updateRow(i, { notes: e.target.value })} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        {formRows.map((row, i) => (
          <div key={row.employeeId} className="card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cream text-sm font-medium">{row.employeeName}</p>
                <p className="text-cream-dark text-xs">{row.role}</p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={row.present}
                  onChange={e => updateRow(i, { present: e.target.checked })}
                  className="w-4 h-4 accent-gold" />
                <span className={`text-xs ${row.present ? 'text-green-400' : 'text-cream-dark'}`}>
                  {row.present ? 'Present' : 'Absent'}
                </span>
              </label>
            </div>
            {row.present && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label text-[9px]">Check In</label>
                    <input type="time" className="input-field text-xs py-1" value={row.checkIn}
                      onChange={e => updateRow(i, { checkIn: e.target.value })} />
                  </div>
                  <div>
                    <label className="label text-[9px]">Check Out</label>
                    <input type="time" className="input-field text-xs py-1" value={row.checkOut}
                      onChange={e => updateRow(i, { checkOut: e.target.value })} />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-cream-dark text-xs">
                    Regular: <span className="text-green-400 font-medium">{row.regularHours}h</span>
                  </span>
                  <span className="text-cream-dark text-xs">
                    Overtime: <span className="text-gold font-medium">{row.overtimeHours}h</span>
                  </span>
                </div>
                <input type="text" placeholder="Notes (optional)" className="input-field text-xs py-1"
                  value={row.notes} onChange={e => updateRow(i, { notes: e.target.value })} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Monthly Salary Tab ───────────────────────────────────────────────────────

function SalaryTab({ employees }) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth()) // 0-indexed
  const [monthRecords, setMonthRecords] = useState([])
  const [loadingMonth, setLoadingMonth] = useState(false)

  const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`

  useEffect(() => {
    setLoadingMonth(true)
    getAttendanceForMonth(monthKey)
      .then(setMonthRecords)
      .catch(err => console.error('getAttendanceForMonth:', err))
      .finally(() => setLoadingMonth(false))
  }, [monthKey])

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1)
  }

  const period = { label: monthLabel(year, month), year, month }

  return (
    <div className="space-y-4">
      {/* Month navigator */}
      <div className="flex items-center gap-2">
        <button onClick={prevMonth} className="btn-ghost p-2"><ChevronLeft size={16} /></button>
        <span className="text-cream font-serif text-base sm:text-lg min-w-[160px] text-center">
          {period.label}
        </span>
        <button onClick={nextMonth} className="btn-ghost p-2"><ChevronRight size={16} /></button>
        {loadingMonth && <Loader size={14} className="animate-spin text-cream-muted ml-2" />}
      </div>

      {employees.length === 0 ? (
        <EmptyState icon={Users} title="No employees" description="Add employees first." />
      ) : (
        <>
          {/* Desktop table */}
          <div className="card overflow-x-auto hidden sm:block">
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr className="border-b border-gold/10">
                  <Th>Employee</Th>
                  <Th>Days</Th>
                  <Th>Reg. Hours</Th>
                  <Th>OT Hours</Th>
                  <Th>Hourly Rate</Th>
                  <Th>OT Rate</Th>
                  <Th>Regular Pay</Th>
                  <Th>OT Pay</Th>
                  <Th>Total</Th>
                  <Th>Slip</Th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp, i) => {
                  const empRecords = monthRecords.filter(a => a.employeeId === emp.id)
                  const totalReg = empRecords.reduce((s, a) => s + (a.regularHours || 0), 0)
                  const totalOT = empRecords.reduce((s, a) => s + (a.overtimeHours || 0), 0)
                  const regPay = totalReg * (Number(emp.hourlyRate) || 0)
                  const otPay = totalOT * (Number(emp.overtimeRate) || 0)
                  const total = regPay + otPay
                  const ratesMissing = !emp.hourlyRate && !emp.overtimeRate

                  return (
                    <tr key={emp.id}
                      className={`border-b border-gold/5 ${i % 2 === 0 ? 'bg-white/[0.01]' : ''}`}>
                      <td className="px-4 py-3">
                        <p className="text-cream text-xs font-medium">{emp.name}</p>
                        <p className="text-cream-dark text-[10px]">{emp.role}</p>
                      </td>
                      <Td>{empRecords.length}</Td>
                      <Td><span className="text-green-400">{totalReg.toFixed(1)}h</span></Td>
                      <Td><span className={totalOT > 0 ? 'text-gold' : 'text-cream-muted'}>{totalOT.toFixed(1)}h</span></Td>
                      <Td>
                        {emp.hourlyRate
                          ? formatCurrency(emp.hourlyRate)
                          : <span className="text-red-400 text-[10px]">Not set</span>}
                      </Td>
                      <Td>
                        {emp.overtimeRate
                          ? formatCurrency(emp.overtimeRate)
                          : <span className="text-red-400 text-[10px]">Not set</span>}
                      </Td>
                      <Td><span className="text-green-400">{formatCurrency(regPay)}</span></Td>
                      <Td><span className={otPay > 0 ? 'text-gold' : 'text-cream-muted'}>{formatCurrency(otPay)}</span></Td>
                      <Td><span className="text-cream font-semibold">{formatCurrency(total)}</span></Td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => exportSalarySlip(emp, empRecords, period)}
                          disabled={empRecords.length === 0 || ratesMissing}
                          title={ratesMissing ? 'Set hourly rates in Settings first' : 'Download salary slip'}
                          className="btn-ghost p-1.5 disabled:opacity-40 disabled:cursor-not-allowed">
                          <Download size={14} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden space-y-3">
            {employees.map(emp => {
              const empRecords = monthRecords.filter(a => a.employeeId === emp.id)
              const totalReg = empRecords.reduce((s, a) => s + (a.regularHours || 0), 0)
              const totalOT = empRecords.reduce((s, a) => s + (a.overtimeHours || 0), 0)
              const total = totalReg * (Number(emp.hourlyRate) || 0) + totalOT * (Number(emp.overtimeRate) || 0)

              return (
                <div key={emp.id} className="card p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-cream text-sm font-medium">{emp.name}</p>
                      <p className="text-cream-dark text-xs">{emp.role}</p>
                    </div>
                    <button
                      onClick={() => exportSalarySlip(emp, empRecords, period)}
                      disabled={empRecords.length === 0 || (!emp.hourlyRate && !emp.overtimeRate)}
                      className="btn-ghost p-1.5 disabled:opacity-40">
                      <Download size={14} />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center mb-3">
                    <div className="bg-charcoal/40 rounded p-2">
                      <p className="text-cream-dark text-[9px] uppercase tracking-widest mb-1">Days</p>
                      <p className="text-cream text-sm">{empRecords.length}</p>
                    </div>
                    <div className="bg-charcoal/40 rounded p-2">
                      <p className="text-cream-dark text-[9px] uppercase tracking-widest mb-1">Reg Hrs</p>
                      <p className="text-green-400 text-sm">{totalReg.toFixed(1)}h</p>
                    </div>
                    <div className="bg-charcoal/40 rounded p-2">
                      <p className="text-cream-dark text-[9px] uppercase tracking-widest mb-1">OT Hrs</p>
                      <p className="text-gold text-sm">{totalOT.toFixed(1)}h</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gold/5 border border-gold/15 rounded">
                    <span className="text-cream-dark text-xs">Total Salary</span>
                    <span className="text-gold font-serif text-sm">{formatCurrency(total)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

// ─── Settings Tab ─────────────────────────────────────────────────────────────

function SettingsTab({ settings, employees, onSettingsSaved, onRatesSaved }) {
  const [workStart, setWorkStart] = useState(settings.workStart || '09:00')
  const [workEnd, setWorkEnd] = useState(settings.workEnd || '17:00')
  const [savingSettings, setSavingSettings] = useState(false)
  const [rates, setRates] = useState([])
  const [savingRates, setSavingRates] = useState(false)

  useEffect(() => {
    setWorkStart(settings.workStart || '09:00')
    setWorkEnd(settings.workEnd || '17:00')
  }, [settings])

  useEffect(() => {
    setRates(employees.map(e => ({
      id: e.id,
      name: e.name,
      role: e.role,
      hourlyRate: e.hourlyRate || '',
      overtimeRate: e.overtimeRate || '',
    })))
  }, [employees])

  async function handleSaveSettings(e) {
    e.preventDefault()
    setSavingSettings(true)
    try {
      await saveAttendanceSettings({ workStart, workEnd })
      onSettingsSaved({ workStart, workEnd })
    } finally {
      setSavingSettings(false)
    }
  }

  async function handleSaveRates() {
    setSavingRates(true)
    try {
      await Promise.all(rates.map(r =>
        updateEmployeeRates(r.id, r.hourlyRate, r.overtimeRate)
      ))
      onRatesSaved(rates)
    } finally {
      setSavingRates(false)
    }
  }

  const standardHours = ((toMins(workEnd) - toMins(workStart)) / 60).toFixed(1)

  return (
    <div className="space-y-5">
      {/* Work Hours */}
      <div className="card p-5">
        <h3 className="font-serif text-cream text-base mb-4 flex items-center gap-2">
          <Clock size={15} className="text-gold" /> Work Hours
        </h3>
        <form onSubmit={handleSaveSettings} className="flex items-end gap-4 flex-wrap">
          <div>
            <label className="label">Work Start</label>
            <input type="time" className="input-field w-36" value={workStart}
              onChange={e => setWorkStart(e.target.value)} />
          </div>
          <div>
            <label className="label">Work End</label>
            <input type="time" className="input-field w-36" value={workEnd}
              onChange={e => setWorkEnd(e.target.value)} />
          </div>
          <div>
            <p className="label">Standard Hours/Day</p>
            <p className="text-gold font-serif text-lg">{standardHours}h</p>
          </div>
          <button type="submit" disabled={savingSettings}
            className="btn-primary flex items-center gap-2">
            {savingSettings && <Loader size={14} className="animate-spin" />}
            Save
          </button>
        </form>
      </div>

      {/* Employee Rates */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4 gap-3">
          <h3 className="font-serif text-cream text-base flex items-center gap-2">
            <DollarSign size={15} className="text-gold" /> Employee Hourly Rates
          </h3>
          <button onClick={handleSaveRates} disabled={savingRates}
            className="btn-primary flex items-center gap-2 text-xs flex-shrink-0">
            {savingRates ? <Loader size={13} className="animate-spin" /> : <Save size={13} />}
            Save Rates
          </button>
        </div>
        {employees.length === 0 ? (
          <p className="text-cream-muted text-sm">No employees added yet.</p>
        ) : (
          <div className="space-y-3">
            {rates.map((r, i) => (
              <div key={r.id}
                className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end p-3 bg-charcoal/30 rounded-lg">
                <div className="sm:pt-4">
                  <p className="text-cream text-sm font-medium">{r.name}</p>
                  <p className="text-cream-dark text-xs">{r.role}</p>
                </div>
                <div>
                  <label className="label text-[9px]">Hourly Rate (Rs.)</label>
                  <input type="number" min="0" step="0.01" placeholder="e.g. 150"
                    className="input-field text-xs py-1" value={r.hourlyRate}
                    onChange={e => setRates(prev => prev.map((x, j) =>
                      j === i ? { ...x, hourlyRate: e.target.value } : x))} />
                </div>
                <div>
                  <label className="label text-[9px]">Overtime Rate (Rs.)</label>
                  <input type="number" min="0" step="0.01" placeholder="e.g. 250"
                    className="input-field text-xs py-1" value={r.overtimeRate}
                    onChange={e => setRates(prev => prev.map((x, j) =>
                      j === i ? { ...x, overtimeRate: e.target.value } : x))} />
                </div>
                <div className="text-right hidden sm:block">
                  {r.hourlyRate ? (
                    <div>
                      <p className="text-cream-dark text-[9px] uppercase tracking-widest mb-0.5">Est. Monthly</p>
                      <p className="text-gold font-serif text-sm">
                        {formatCurrency(Number(r.hourlyRate) * Number(standardHours) * 26)}
                      </p>
                    </div>
                  ) : (
                    <p className="text-cream-dark text-[10px]">Set rate to see estimate</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'daily', label: 'Daily Attendance', icon: CalendarDays },
  { id: 'salary', label: 'Monthly Salary', icon: DollarSign },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export default function AttendancePage() {
  const [tab, setTab] = useState('daily')
  const {
    employees, loadingEmp, fetchEmployees,
    attendanceSettings, setAttendanceSettings, fetchAttendanceSettings,
    setEmployees,
  } = useApp()

  useEffect(() => {
    fetchEmployees()
    fetchAttendanceSettings()
  }, [fetchEmployees, fetchAttendanceSettings])

  if (loadingEmp) return <Spinner />

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="section-title">Attendance & Payroll</h2>
        <p className="section-subtitle hidden sm:block">
          Track daily attendance and generate salary reports
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-charcoal/40 p-1 rounded-lg w-fit">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all duration-200
              ${tab === t.id
                ? 'bg-gold/20 text-gold border border-gold/30'
                : 'text-cream-muted hover:text-cream'}`}>
            <t.icon size={13} />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'daily' && (
        <DailyTab
          employees={employees}
          settings={attendanceSettings}
        />
      )}
      {tab === 'salary' && (
        <SalaryTab
          employees={employees}
        />
      )}
      {tab === 'settings' && (
        <SettingsTab
          settings={attendanceSettings}
          employees={employees}
          onSettingsSaved={newSettings => setAttendanceSettings(newSettings)}
          onRatesSaved={rates => {
            setEmployees(prev => prev.map(emp => {
              const r = rates.find(x => x.id === emp.id)
              return r ? { ...emp, hourlyRate: Number(r.hourlyRate) || 0, overtimeRate: Number(r.overtimeRate) || 0 } : emp
            }))
          }}
        />
      )}
    </div>
  )
}

function Th({ children }) {
  return (
    <th className="text-left text-cream-dark text-[10px] uppercase tracking-widest px-4 py-3 font-medium">
      {children}
    </th>
  )
}
function Td({ children }) {
  return <td className="px-4 py-3 text-cream-muted text-xs">{children}</td>
}
