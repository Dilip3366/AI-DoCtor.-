import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Calendar, Search, Filter, X, CheckCircle, Clock } from 'lucide-react'
import api from '../utils/api'
import useAuthStore from '../hooks/useAuthStore'
import toast from 'react-hot-toast'

const STATUS_COLORS = {
  scheduled: 'badge-blue', confirmed: 'badge-green', 'in-progress': 'badge-yellow',
  completed: 'badge-green', cancelled: 'badge-red', 'no-show': 'badge-red',
}

export default function AppointmentsPage() {
  const { user } = useAuthStore()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const fetchAppointments = async () => {
    setLoading(true)
    try {
      let url = '/appointments'
      if (statusFilter) url += `?status=${statusFilter}`
      const res = await api.get(url)
      setAppointments(res.data.appointments || [])
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAppointments() }, [statusFilter])

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/appointments/${id}/status`, { status })
      toast.success(`Appointment ${status}`)
      fetchAppointments()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const cancelAppointment = async (id) => {
    if (!confirm('Cancel this appointment?')) return
    try {
      await api.delete(`/appointments/${id}`)
      toast.success('Appointment cancelled')
      fetchAppointments()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const filtered = appointments.filter((a) => {
    const name = user.role === 'patient' ? a.doctor?.name : a.patient?.name
    return name?.toLowerCase().includes(search.toLowerCase())
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-bold text-slate-800">Appointments</h2>
        <span className="badge-blue">{appointments.length} total</span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input className="input pl-9" placeholder="Search by name..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input w-auto" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          {['scheduled','confirmed','in-progress','completed','cancelled','no-show'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4].map(i => <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16 text-slate-400">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="text-lg font-medium">No appointments found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((appt) => (
            <div key={appt._id} className="card hover:shadow-md transition-all duration-200">
              <div className="flex flex-wrap items-start gap-4 justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center font-bold text-primary-600 text-lg shrink-0">
                    {(user.role === 'patient' ? appt.doctor?.name : appt.patient?.name)?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">
                      {user.role === 'patient' ? `Dr. ${appt.doctor?.name}` : appt.patient?.name}
                    </p>
                    <p className="text-sm text-slate-500">
                      {appt.doctor?.specialization} · {appt.type}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{format(new Date(appt.date), 'MMM d, yyyy')}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{appt.timeSlot}</span>
                      {appt.consultationFee && <span>₹{appt.consultationFee}</span>}
                    </div>
                    {appt.symptoms?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {appt.symptoms.map((s, i) => <span key={i} className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">{s}</span>)}
                      </div>
                    )}
                    {appt.aiSuggestions?.urgencyLevel && appt.aiSuggestions.urgencyLevel !== 'low' && (
                      <div className="mt-2 text-xs text-orange-600 bg-orange-50 px-3 py-1 rounded-lg inline-block">
                        🤖 AI Urgency: {appt.aiSuggestions.urgencyLevel}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={STATUS_COLORS[appt.status] || 'badge-blue'}>{appt.status}</span>
                  <div className="flex gap-2">
                    {user.role === 'doctor' && appt.status === 'scheduled' && (
                      <>
                        <button onClick={() => updateStatus(appt._id, 'confirmed')} className="text-xs btn-primary py-1.5 px-3">Confirm</button>
                        <button onClick={() => updateStatus(appt._id, 'completed')} className="text-xs btn-secondary py-1.5 px-3">Complete</button>
                      </>
                    )}
                    {['scheduled','confirmed'].includes(appt.status) && (
                      <button onClick={() => cancelAppointment(appt._id)} className="text-xs text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors">
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
