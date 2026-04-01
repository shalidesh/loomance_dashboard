import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  setDoc,
  query,
  orderBy,
  where,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { db } from './config'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toDate(val) {
  if (!val) return null
  if (val instanceof Date) return val
  if (val?.toDate) return val.toDate()
  return new Date(val)
}

function mapDoc(d) {
  return {
    id: d.id,
    ...d.data(),
    date: toDate(d.data().date),
    createdAt: toDate(d.data().createdAt),
  }
}

// ─── Transactions ─────────────────────────────────────────────────────────────

export async function addTransaction(data) {
  const docRef = await addDoc(collection(db, 'transactions'), {
    ...data,
    amount: Number(data.amount),
    date: Timestamp.fromDate(new Date(data.date)),
    createdAt: serverTimestamp(),
  })
  return docRef.id
}

export async function getAllTransactions() {
  const q = query(collection(db, 'transactions'), orderBy('date', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(mapDoc)
}

export async function updateTransaction(id, data) {
  const ref = doc(db, 'transactions', id)
  await updateDoc(ref, {
    ...data,
    amount: Number(data.amount),
    date: Timestamp.fromDate(new Date(data.date)),
  })
}

export async function deleteTransaction(id) {
  await deleteDoc(doc(db, 'transactions', id))
}

// ─── Employees ────────────────────────────────────────────────────────────────

export async function addEmployee(data) {
  const docRef = await addDoc(collection(db, 'employees'), {
    ...data,
    dailyWage: Number(data.dailyWage || 0),
    monthlyWage: Number(data.monthlyWage || 0),
    createdAt: serverTimestamp(),
  })
  return docRef.id
}

export async function getAllEmployees() {
  const snap = await getDocs(collection(db, 'employees'))
  return snap.docs.map(mapDoc)
}

export async function updateEmployee(id, data) {
  const ref = doc(db, 'employees', id)
  await updateDoc(ref, {
    ...data,
    dailyWage: Number(data.dailyWage || 0),
    monthlyWage: Number(data.monthlyWage || 0),
  })
}

export async function deleteEmployee(id) {
  await deleteDoc(doc(db, 'employees', id))
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export async function addOrder(data) {
  const docRef = await addDoc(collection(db, 'orders'), {
    ...data,
    orderValue: Number(data.orderValue || 0),
    advancePaid: Number(data.advancePaid || 0),
    balanceDue: Number(data.balanceDue || 0),
    date: Timestamp.fromDate(new Date(data.date)),
    createdAt: serverTimestamp(),
  })
  return docRef.id
}

export async function getAllOrders() {
  const q = query(collection(db, 'orders'), orderBy('date', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(mapDoc)
}

export async function updateOrder(id, data) {
  const ref = doc(db, 'orders', id)
  await updateDoc(ref, {
    ...data,
    orderValue: Number(data.orderValue || 0),
    advancePaid: Number(data.advancePaid || 0),
    balanceDue: Number(data.balanceDue || 0),
    date: Timestamp.fromDate(new Date(data.date)),
  })
}

export async function deleteOrder(id) {
  await deleteDoc(doc(db, 'orders', id))
}

// ─── Attendance ───────────────────────────────────────────────────────────────

function mapAttendanceDoc(d) {
  const data = d.data()
  return {
    id: d.id,
    ...data,
    date: data.date?.toDate?.() ?? null,
    // checkIn / checkOut remain as plain strings
  }
}

export async function saveAttendanceRecord(employeeId, dateStr, data) {
  const docId = `${employeeId}_${dateStr}`
  const monthKey = dateStr.slice(0, 7) // 'YYYY-MM'
  await setDoc(doc(db, 'attendance', docId), {
    employeeId,
    monthKey,
    date: Timestamp.fromDate(new Date(dateStr + 'T12:00:00')),
    ...data,
    regularHours: Number(data.regularHours || 0),
    overtimeHours: Number(data.overtimeHours || 0),
    updatedAt: serverTimestamp(),
  }, { merge: true })
  return docId
}

export async function getAttendanceForDate(employeeIds, dateStr) {
  const refs = employeeIds.map(id => doc(db, 'attendance', `${id}_${dateStr}`))
  const snaps = await Promise.all(refs.map(r => getDoc(r)))
  return snaps.filter(s => s.exists()).map(mapAttendanceDoc)
}

export async function getAttendanceForMonth(monthKey) {
  const q = query(collection(db, 'attendance'), where('monthKey', '==', monthKey))
  const snap = await getDocs(q)
  return snap.docs
    .map(mapAttendanceDoc)
    .sort((a, b) => (a.date || 0) - (b.date || 0))
}

export async function deleteAttendanceRecord(docId) {
  await deleteDoc(doc(db, 'attendance', docId))
}

// ─── Attendance Settings ──────────────────────────────────────────────────────

export async function getAttendanceSettings() {
  const snap = await getDoc(doc(db, 'settings', 'attendance'))
  return snap.exists() ? snap.data() : { workStart: '09:00', workEnd: '17:00' }
}

export async function saveAttendanceSettings(data) {
  await setDoc(doc(db, 'settings', 'attendance'), data)
}

// ─── Employee Rates ───────────────────────────────────────────────────────────

export async function updateEmployeeRates(id, hourlyRate, overtimeRate) {
  await updateDoc(doc(db, 'employees', id), {
    hourlyRate: Number(hourlyRate || 0),
    overtimeRate: Number(overtimeRate || 0),
  })
}
