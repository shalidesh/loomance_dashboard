import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
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
