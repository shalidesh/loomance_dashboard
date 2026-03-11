import React from 'react'
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { formatCurrencyShort } from '../../utils/formatters'

const TOOLTIP_STYLE = {
  backgroundColor: '#1a1a2e',
  border: '1px solid rgba(201,169,110,0.3)',
  borderRadius: '8px',
  color: '#f5f0e8',
  fontSize: '12px',
  padding: '10px 14px',
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={TOOLTIP_STYLE}>
      <p className="text-gold text-xs font-medium mb-2 uppercase tracking-wider">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex justify-between gap-6 text-xs">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="text-cream font-medium">Rs. {Number(p.value).toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

export default function RevenueChart({ data }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-serif text-lg text-cream">Revenue vs Expenses</h3>
          <p className="text-cream-muted text-xs mt-0.5">Last 6 months overview</p>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="flex items-center justify-center h-[260px] text-cream-muted text-sm">
          No data to display
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#c9a96e" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#c9a96e" stopOpacity={0.4} />
              </linearGradient>
              <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#e07070" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#e07070" stopOpacity={0.4} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(201,169,110,0.08)"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              tick={{ fill: '#b8a99a', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatCurrencyShort}
              tick={{ fill: '#b8a99a', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={68}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(v) => (
                <span style={{ color: '#b8a99a', fontSize: 11 }}>{v}</span>
              )}
            />
            <Bar
              dataKey="income"
              name="Income"
              fill="url(#incomeGrad)"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
            <Bar
              dataKey="expenses"
              name="Expenses"
              fill="url(#expenseGrad)"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
            <Line
              type="monotone"
              dataKey="income"
              stroke="#c9a96e"
              strokeWidth={1.5}
              dot={false}
              legendType="none"
              strokeDasharray="4 4"
              strokeOpacity={0.5}
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
