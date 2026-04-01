import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { getAllTransactions, getAllEmployees, getAllOrders, getAttendanceSettings } from '../firebase/services'

const AppContext = createContext(null)

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

export function AppProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('auth') === 'true')
  const [businessUnit, setBusinessUnit] = useState('all') // 'all' | 'shop' | 'garment'
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')

  function login(username, password) {
    if (username === 'admin' && password === 'loomance2024') {
      localStorage.setItem('auth', 'true')
      setIsAuthenticated(true)
      return true
    }
    return false
  }

  function logout() {
    localStorage.removeItem('auth')
    setIsAuthenticated(false)
  }

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')
  const [transactions, setTransactions] = useState([])
  const [employees, setEmployees] = useState([])
  const [orders, setOrders] = useState([])
  const [loadingTx, setLoadingTx] = useState(false)
  const [loadingEmp, setLoadingEmp] = useState(false)
  const [loadingOrd, setLoadingOrd] = useState(false)
  const [attendanceSettings, setAttendanceSettings] = useState({ workStart: '09:00', workEnd: '17:00' })
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

  const fetchAttendanceSettings = useCallback(async () => {
    try {
      const data = await getAttendanceSettings()
      setAttendanceSettings(data)
    } catch (err) {
      console.error('fetchAttendanceSettings:', err)
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
        isAuthenticated,
        login,
        logout,
        businessUnit,
        setBusinessUnit,
        sidebarOpen,
        setSidebarOpen,
        mobileSidebarOpen,
        setMobileSidebarOpen,
        theme,
        toggleTheme,
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
        attendanceSettings,
        setAttendanceSettings,
        fetchAttendanceSettings,
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
