import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Users, UserCheck, Activity, Clock, ArrowRight, Bot } from 'lucide-react'
import api from '../utils/api'
import useAuthStore from '../hooks/useAuthStore'
import { format } from 'date-fns'

const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div className="card hover:shadow-md transition-all duration-200">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-slate-500 font-medium">{label}</p>
        <p className="text-3xl font-display font-bold text-slate-800 mt-1">{value ?? '—'}</p>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
      </div>
      <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
)

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [appointments, setAppointments] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apptRes = await api.get('/appointments?status=scheduled')
        setAppointments(apptRes.data.appointments?.slice(0, 5) || [])
        if (user.role === 'admin') {
          const statsRes = await api.get('/analytics/dashboard')
          setStats(statsRes.data.stats)
        } else if (user.role === 'doctor') {
          const statsRes = await api.get('/analytics/doctor')
          setStats(statsRes.data.stats)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user.role])

  const statusBadge = (status) => {
    const map = { scheduled:'badge-blue', confirmed:'badge-green', 'in-progress':'badge-yellow', completed:'badge-green', cancelled:'badge-red' }
    return <span className={map[status] || 'badge-blue'}>{status}</span>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-slate-800">Dashboard</h2>
          <p className="text-slate-500 text-sm mt-0.5">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </div>
        {user.role === 'patient' && (
          <Link to="/book-appointment" className="btn-primary flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Book Appointment
          </Link>
        )}
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {user.role === 'admin' ? (
            <>
              <StatCard icon={Users} label="Total Patients" value={stats.totalPatients} color="bg-blue-500" />
              <StatCard icon={UserCheck} label="Total Doctors" value={stats.totalDoctors} color="bg-emerald-500" />
              <StatCard icon={Calendar} label="Total Appointments" value={stats.totalAppointments} color="bg-purple-500" />
              <StatCard icon={Activity} label="Today's Appointments" value={stats.todayAppointments} color="bg-amber-500" sub="scheduled today" />
            </>
          ) : (
            <>
              <StatCard icon={Calendar} label="Total Appointments" value={stats.total} color="bg-blue-500" />
              <StatCard icon={Activity} label="Completed" value={stats.completed} color="bg-emerald-500" />
              <StatCard icon={Clock} label="Pending" value={stats.pending} color="bg-amber-500" />
              <StatCard icon={Calendar} label="Today" value={stats.todayCount} color="bg-purple-500" sub="scheduled today" />
            </>
          )}
        </div>
      )}

      {/* AI Banner */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 text-white flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg">AI Medical Assistant</h3>
            <p className="text-primary-100 text-sm">Check symptoms, get appointment help, and more</p>
          </div>
        </div>
        <Link to="/ai-assistant" className="bg-white text-primary-700 font-semibold px-4 py-2.5 rounded-xl text-sm hover:bg-primary-50 transition-colors flex items-center gap-2">
          Open <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Recent Appointments */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-bold text-slate-800">Recent Appointments</h3>
          <Link to="/appointments" className="text-sm text-primary-600 hover:underline font-medium flex items-center gap-1">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>No upcoming appointments</p>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map((appt) => (
              <div key={appt._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center font-bold text-primary-600">
                    {(user.role === 'patient' ? appt.doctor?.name : appt.patient?.name)?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700 text-sm">
                      {user.role === 'patient' ? `Dr. ${appt.doctor?.name}` : appt.patient?.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {appt.doctor?.specialization} · {format(new Date(appt.date), 'MMM d')} · {appt.timeSlot}
                    </p>
                  </div>
                </div>
                {statusBadge(appt.status)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
