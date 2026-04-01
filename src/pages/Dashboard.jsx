import React, { useEffect, useMemo } from 'react'
import { TrendingUp, TrendingDown, Wallet, ShoppingBag, Scissors } from 'lucide-react'
import { useApp } from '../context/AppContext'
import SummaryCard from '../components/Dashboard/SummaryCard'
import RevenueChart from '../components/Dashboard/RevenueChart'
import RecentTransactions from '../components/Dashboard/RecentTransactions'
import Spinner from '../components/UI/Spinner'
import { formatCurrency, calcSummary, getMonthlyChartData, unitLabel } from '../utils/formatters'

export default function Dashboard() {
  const { filteredTransactions, loadingTx, fetchTransactions, businessUnit, orders, fetchOrders, loadingOrd } = useApp()

  useEffect(() => {
    fetchTransactions()
    fetchOrders()
  }, [fetchTransactions, fetchOrders])

  const summary = useMemo(() => calcSummary(filteredTransactions), [filteredTransactions])

  const shopSummary = useMemo(
    () => calcSummary(filteredTransactions.filter((t) => t.businessUnit === 'shop')),
    [filteredTransactions]
  )
  const garmentSummary = useMemo(
    () => calcSummary(filteredTransactions.filter((t) => t.businessUnit === 'garment')),
    [filteredTransactions]
  )

  // Income from orders collection for Garment Division:
  // completed → full orderValue, in-progress → advancePaid only
  const garmentOrderIncome = useMemo(
    () =>
      orders.reduce((sum, o) => {
        if (o.status === 'completed') return sum + (Number(o.orderValue) || 0)
        if (o.status === 'in-progress') return sum + (Number(o.advancePaid) || 0)
        return sum
      }, 0),
    [orders]
  )

  // Only add order income when garment is in scope
  const orderIncomeApplies = businessUnit === 'all' || businessUnit === 'garment'
  const totalRevenue = summary.totalIncome + (orderIncomeApplies ? garmentOrderIncome : 0)
  const netProfit = totalRevenue - summary.totalExpenses

  const chartData = useMemo(() => getMonthlyChartData(filteredTransactions), [filteredTransactions])

  if (loadingTx || loadingOrd) return <Spinner />

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 animate-fade-in">
      {/* Greeting */}
      <div>
        <h2 className="font-serif text-2xl sm:text-3xl text-gradient-gold">
          {unitLabel(businessUnit)}
        </h2>
        <p className="text-cream-muted text-sm mt-1">
          {new Date().toLocaleDateString('en-LK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Primary summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          icon={TrendingUp}
          color="green"
          subtitle="All income recorded"
        />
        <SummaryCard
          title="Total Expenses"
          value={formatCurrency(summary.totalExpenses)}
          icon={TrendingDown}
          color="red"
          subtitle="All costs incurred"
        />
        <SummaryCard
          title="Net Profit"
          value={formatCurrency(netProfit)}
          icon={Wallet}
          color={netProfit >= 0 ? 'gold' : 'red'}
          subtitle={netProfit >= 0 ? 'Profitable period' : 'Loss period'}
        />
      </div>

      {/* Per-unit breakdown (only when 'all' is selected) */}
      {businessUnit === 'all' && (
        <>
          <div className="gold-divider" />
          <div>
            <p className="text-cream-muted text-[10px] uppercase tracking-[0.2em] mb-3">
              Business Unit Breakdown
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="card p-5 border-l-2 border-l-gold/40">
                <div className="flex items-center gap-2 mb-3">
                  <ShoppingBag size={15} className="text-gold" />
                  <span className="text-cream text-sm font-medium">Clothing Shop</span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <Metric label="Revenue" value={formatCurrency(shopSummary.totalIncome)} color="text-green-400" />
                  <Metric label="Expenses" value={formatCurrency(shopSummary.totalExpenses)} color="text-red-400" />
                  <Metric label="Profit" value={formatCurrency(shopSummary.netProfit)} color={shopSummary.netProfit >= 0 ? 'text-gold' : 'text-red-400'} />
                </div>
              </div>

              <div className="card p-5 border-l-2 border-l-gold/40">
                <div className="flex items-center gap-2 mb-3">
                  <Scissors size={15} className="text-gold" />
                  <span className="text-cream text-sm font-medium">Garment Division</span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <Metric label="Revenue" value={formatCurrency(garmentSummary.totalIncome + garmentOrderIncome)} color="text-green-400" />
                  <Metric label="Expenses" value={formatCurrency(garmentSummary.totalExpenses)} color="text-red-400" />
                  <Metric label="Profit" value={formatCurrency(garmentSummary.totalIncome + garmentOrderIncome - garmentSummary.totalExpenses)} color={(garmentSummary.totalIncome + garmentOrderIncome - garmentSummary.totalExpenses) >= 0 ? 'text-gold' : 'text-red-400'} />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RevenueChart data={chartData} />
        <RecentTransactions transactions={filteredTransactions} />
      </div>
    </div>
  )
}

function Metric({ label, value, color }) {
  return (
    <div>
      <p className="text-cream-dark text-[9px] uppercase tracking-widest mb-1">{label}</p>
      <p className={`font-serif text-sm font-semibold ${color}`}>{value}</p>
    </div>
  )
}
