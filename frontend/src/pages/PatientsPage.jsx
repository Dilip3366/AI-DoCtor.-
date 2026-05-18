// PatientsPage.jsx
import { useEffect, useState } from 'react'
import { Search, User } from 'lucide-react'
import api from '../utils/api'
import { format } from 'date-fns'

export function PatientsPage() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get('/patients').then(r => setPatients(r.data.patients || [])).finally(() => setLoading(false))
  }, [])

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-display font-bold text-slate-800">Patients</h2>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input className="input pl-9" placeholder="Search patients..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />)}</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(p => (
            <div key={p._id} className="card flex items-center gap-4 hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center font-bold text-white text-lg">
                {p.name.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-800">{p.name}</p>
                <p className="text-sm text-slate-500">{p.email} · {p.phone}</p>
              </div>
              <div className="text-right text-sm text-slate-400">
                {p.bloodGroup && <span className="badge-red mr-2">{p.bloodGroup}</span>}
                <span>Joined {format(new Date(p.createdAt), 'MMM yyyy')}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
export default PatientsPage
