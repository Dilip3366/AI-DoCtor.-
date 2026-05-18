import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Star, Clock, IndianRupee } from 'lucide-react'
import api from '../utils/api'

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get('/doctors').then(r => setDoctors(r.data.doctors || [])).finally(() => setLoading(false))
  }, [])

  const filtered = doctors.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.specialization?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-display font-bold text-slate-800">Our Doctors</h2>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input className="input pl-9" placeholder="Search doctors..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-52 bg-slate-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(doc => (
            <div key={doc._id} className="card hover:shadow-lg transition-all duration-200 group">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-primary-400 to-accent-500 rounded-2xl flex items-center justify-center font-bold text-white text-xl shadow-sm">
                  {doc.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-display font-bold text-slate-800">Dr. {doc.name}</h3>
                  <p className="text-sm text-primary-600 font-medium">{doc.specialization}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm text-slate-500 mb-4">
                {doc.experience && (
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-400" />
                    <span>{doc.experience} years experience</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <IndianRupee className="w-4 h-4" />
                  <span>₹{doc.consultationFee} consultation fee</span>
                </div>
              </div>

              <Link to="/book-appointment" className="btn-primary w-full text-center block text-sm">
                Book Appointment
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
