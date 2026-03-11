import React, { createContext, useContext, useState, useCallback } from 'react'
import { getAllTransactions, getAllEmployees, getAllOrders } from '../firebase/services'

const AppContext = createContext(null)

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

export function AppProvider({ children }) {
  const [businessUnit, setBusinessUnit] = useState('all') // 'all' | 'shop' | 'garment'
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [transactions, setTransactions] = useState([])
  const [employees, setEmployees] = useState([])
  const [orders, setOrders] = useState([])
  const [loadingTx, setLoadingTx] = useState(false)
  const [loadingEmp, setLoadingEmp] = useState(false)
  const [loadingOrd, setLoadingOrd] = useState(false)
  const [error, setError] = useState(null)

  const fetchTransactions = useCallback(async () => {
    setLoadingTx(true)
    setError(null)
    try {
      const data = await getAllTransactions()
      setTransactions(data)
    } catch (err) {
      console.error('fetchTransactions:', err)
      setError(err.message)
    } finally {
      setLoadingTx(false)
    }
  }, [])

  const fetchEmployees = useCallback(async () => {
    setLoadingEmp(true)
    try {
      const data = await getAllEmployees()
      setEmployees(data)
    } catch (err) {
      console.error('fetchEmployees:', err)
    } finally {
      setLoadingEmp(false)
    }
  }, [])

  const fetchOrders = useCallback(async () => {
    setLoadingOrd(true)
    try {
      const data = await getAllOrders()
      setOrders(data)
    } catch (err) {
      console.error('fetchOrders:', err)
    } finally {
      setLoadingOrd(false)
    }
  }, [])

  // Derived: filtered transactions by selected business unit
  const filteredTransactions =
    businessUnit === 'all'
      ? transactions
      : transactions.filter((t) => t.businessUnit === businessUnit)

  return (
    <AppContext.Provider
      value={{
        businessUnit,
        setBusinessUnit,
        sidebarOpen,
        setSidebarOpen,
        transactions,
        setTransactions,
        filteredTransactions,
        employees,
        setEmployees,
        orders,
        setOrders,
        loadingTx,
        loadingEmp,
        loadingOrd,
        error,
        fetchTransactions,
        fetchEmployees,
        fetchOrders,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
