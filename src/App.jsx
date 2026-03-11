import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Layout from './components/Layout/Layout'
import Dashboard from './pages/Dashboard'
import Income from './pages/Income'
import Expenses from './pages/Expenses'
import Employees from './pages/Employees'
import Reports from './pages/Reports'
import History from './pages/History'

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="income" element={<Income />} />
            <Route path="expenses" element={<Expenses />} />
            <Route path="employees" element={<Employees />} />
            <Route path="reports" element={<Reports />} />
            <Route path="history" element={<History />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
