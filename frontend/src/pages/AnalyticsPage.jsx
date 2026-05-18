import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import api from '../utils/api'
import useAuthStore from '../hooks/useAuthStore'

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function AnalyticsPage() {
  const { user } = useAuthStore()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const url = user.role === 'admin' ? '/analytics/dashboard' : '/analytics/doctor'
    api.get(url).then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-48 bg-slate-100 rounded-2xl animate-pulse" />)}</div>

  const monthlyData = data?.monthlyTrend?.map(m => ({
    month: MONTHS[m._id.month - 1],
    appointments: m.count,
    revenue: m.revenue || 0,
  })) || []

  const statusData = data?.statusBreakdown?.map(s => ({
    name: s._id, value: s.count
  })) || []

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-display font-bold text-slate-800">Analytics</h2>

      {/* Stats */}
      {data?.stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(data.stats).map(([key, val]) => (
            <div key={key} className="card">
              <p className="text-xs text-slate-400 uppercase tracking-wider">{key.replace(/([A-Z])/g, ' $1')}</p>
              <p className="text-3xl font-display font-bold text-slate-800 mt-1">
                {key.includes('evenue') || key.includes('fee') ? `₹${val?.toLocaleString()}` : val}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Monthly chart */}
      {monthlyData.length > 0 && (
        <div className="card">
          <h3 className="font-display font-bold text-slate-800 mb-6">Monthly Appointments</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="appointments" fill="#0ea5e9" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Status breakdown */}
      {statusData.length > 0 && (
        <div className="card">
          <h3 className="font-display font-bold text-slate-800 mb-6">Appointment Status</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top doctors */}
      {data?.topDoctors?.length > 0 && (
        <div className="card">
          <h3 className="font-display font-bold text-slate-800 mb-4">Top Doctors by Appointments</h3>
          <div className="space-y-3">
            {data.topDoctors.map((d, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="text-lg font-bold text-slate-300 w-6">#{i+1}</span>
                <div className="w-9 h-9 bg-gradient-to-br from-primary-400 to-accent-500 rounded-full flex items-center justify-center font-bold text-white text-sm">
                  {d.name?.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-700 text-sm">Dr. {d.name}</p>
                  <p className="text-xs text-slate-400">{d.specialization}</p>
                </div>
                <span className="badge-blue">{d.count} appointments</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
